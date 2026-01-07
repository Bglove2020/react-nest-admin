import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggingService } from '../logging/logging.service';
import { AlsService } from '../als/als.service';

/**
 * 日志拦截器
 * 记录两条简洁日志：
 * 1. 请求日志：记录请求参数（query、params、body）
 * 2. 响应日志：记录响应结果（statusCode、duration、code、msg、logData）
 *
 * Controller 可以通过 logdata 字段指定要记录的日志内容，
 * 拦截器会自动删除该字段后再返回给前端。
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly alsService: AlsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 只处理HTTP请求
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // 1. 记录请求日志
    this.logRequest(request);

    // 记录请求开始时间
    const startTime = Date.now();

    // 处理响应
    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - startTime;

        // 2. 记录响应日志
        this.logResponse(request, response, responseData, duration);

        // 3. 删除 logdata 字段
        if (responseData && 'logdata' in responseData) {
          delete responseData.logdata;
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // 记录错误日志
        this.logError(request, error, duration);

        // 继续抛出错误，让异常过滤器处理
        return throwError(() => error);
      }),
    );
  }

  /**
   * 记录请求日志
   * 格式：[timestamp] INFO  METHOD /path?query
   *       [userId:xxx] [requestId:xxx]
   *       { query, params, body }
   */
  private logRequest(request: Request): void {
    const { method, url, query, body, params } = request;

    // 构建请求参数对象
    const requestData: any = {};

    // 只记录非空的查询参数
    if (query && Object.keys(query).length > 0) {
      requestData.query = query;
    }

    // 只记录非空的路径参数
    if (params && Object.keys(params).length > 0) {
      requestData.params = params;
    }

    // 只记录非空的请求体（过滤敏感信息）
    if (body && Object.keys(body).length > 0) {
      requestData.body = this.sanitizeBody(body);
    }

    // 记录日志，标题为完整的 URL
    this.loggingService.log(`${method} ${url}`, requestData);
  }

  /**
   * 记录响应日志
   * 格式：[timestamp] INFO  METHOD /path?query
   *       [userId:xxx] [requestId:xxx]
   *       { statusCode, duration, code, msg, logData }
   */
  private logResponse(
    request: Request,
    response: Response,
    responseData: any,
    duration: number,
  ): void {
    const { method, url } = request;

    const logData: any = {
      statusCode: response.statusCode,
      duration: `${duration}ms`,
      code: responseData?.code,
      msg: responseData?.msg,
    };

    // 提取 logData（优先使用 logdata 字段，否则使用 data 字段）
    const extractedLogData = this.extractLogData(responseData);
    if (extractedLogData !== undefined) {
      logData.logData = extractedLogData;
    }

    // 记录日志，标题为完整的 URL（与请求日志保持一致）
    this.loggingService.log(`${method} ${url}`, logData);
  }

  /**
   * 记录错误日志
   */
  private logError(request: Request, error: any, duration: number): void {
    const { method, url } = request;
    const statusCode = error?.status || 500;

    this.loggingService.error(`${method} ${url}`, {
      statusCode,
      duration: `${duration}ms`,
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
    });
  }

  /**
   * 提取日志数据
   * 优先使用 logdata 字段，否则使用 data 字段
   */
  private extractLogData(response: any): any {
    if (!response || typeof response !== 'object') {
      return undefined;
    }

    // 优先使用 logdata 字段
    if ('logdata' in response) {
      return response.logdata;
    }

    // 否则使用 data 字段
    return response.data;
  }

  /**
   * 清理请求体中的敏感信息
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }
}

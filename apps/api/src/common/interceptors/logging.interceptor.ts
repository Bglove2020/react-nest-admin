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

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly loggingService: LoggingService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    this.logRequest(request);
    const startTime = Date.now();

    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - startTime;
        this.logResponse(request, response, responseData, duration);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logError(request, error, duration);
        return throwError(() => error);
      }),
    );
  }

  private logRequest(request: Request): void {
    const { method, url, query, body, params } = request;

    const requestData: Record<string, unknown> = {};

    if (query && Object.keys(query).length > 0) {
      requestData.query = query;
    }

    if (params && Object.keys(params).length > 0) {
      requestData.params = params;
    }

    if (body && Object.keys(body).length > 0) {
      requestData.body = this.sanitizeBody(body);
    }

    this.loggingService.log(`${method} ${url}`, requestData);
  }

  private logResponse(
    request: Request,
    response: Response,
    responseData: unknown,
    duration: number,
  ): void {
    const { method, url } = request;

    const logData: Record<string, unknown> = {
      statusCode: response.statusCode,
      duration: `${duration}ms`,
      code: this.getResponseField(responseData, 'code'),
      msg: this.getResponseField(responseData, 'msg'),
    };

    const extractedLogData = this.extractLogData(responseData);
    if (extractedLogData !== undefined) {
      logData.logData = extractedLogData;
    }

    this.loggingService.log(`${method} ${url}`, logData);
  }

  private logError(request: Request, error: unknown, duration: number): void {
    const { method, url } = request;
    const statusCode = this.getErrorStatus(error);

    this.loggingService.error(`${method} ${url}`, {
      statusCode,
      duration: `${duration}ms`,
      error: this.normalizeError(error),
    });
  }

  private extractLogData(response: unknown): unknown {
    if (!response || typeof response !== 'object') {
      return undefined;
    }

    const data = (response as { data?: unknown }).data;
    if (data === undefined) {
      return undefined;
    }

    if (data && typeof data === 'object' && 'list' in data) {
      const { list, ...rest } = data as Record<string, unknown> & {
        list?: unknown;
      };
      return {
        ...rest,
        listLength: Array.isArray(list) ? list.length : 0,
      };
    }

    return data;
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...(body as Record<string, unknown>) };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }

  private getResponseField(
    responseData: unknown,
    field: 'code' | 'msg',
  ): unknown {
    if (!responseData || typeof responseData !== 'object') {
      return undefined;
    }
    return (responseData as Record<string, unknown>)[field];
  }

  private getErrorStatus(error: unknown): number {
    if (!error || typeof error !== 'object') {
      return 500;
    }

    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : 500;
  }

  private normalizeError(error: unknown): Record<string, unknown> {
    if (!error || typeof error !== 'object') {
      return { message: String(error) };
    }

    return {
      name: (error as { name?: unknown }).name,
      message: (error as { message?: unknown }).message,
      stack: (error as { stack?: unknown }).stack,
    };
  }
}

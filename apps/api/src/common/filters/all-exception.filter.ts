import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { LoggingService } from '../logging/logging.service';
import { ApiResponse } from '../types/response.types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorData = this.buildErrorPayload(exception);
    this.loggingService.error(`${request.method} ${request.url}`, errorData);

    const body = this.buildResponseBody(exception, status);
    response.status(status).json(body);
  }

  private buildErrorPayload(exception: unknown): Record<string, unknown> {
    if (exception instanceof QueryFailedError) {
      const driverError = (exception as { driverError?: unknown }).driverError;
      const driverInfo =
        driverError && typeof driverError === 'object'
          ? {
              code: (driverError as { code?: unknown }).code,
              sqlMessage: (driverError as { sqlMessage?: unknown }).sqlMessage,
            }
          : undefined;

      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
        query: exception.query,
        parameters: exception.parameters,
        driverError: driverInfo,
      };
    }

    if (exception instanceof HttpException) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
        status: exception.getStatus(),
        response: exception.getResponse(),
      };
    }

    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }

    return {
      name: 'NonErrorException',
      message: this.normalizeMessage(exception),
    };
  }

  private buildResponseBody(
    exception: unknown,
    status: number,
  ): ApiResponse<null> {
    let code = status;
    let msg = status === 500 ? '系统异常' : '请求错误';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        msg = res;
      } else if (res && typeof res === 'object') {
        const payload = res as Record<string, unknown>;
        if (typeof payload.code === 'number') {
          code = payload.code;
        }

        if (typeof payload.msg === 'string') {
          msg = payload.msg;
        } else if (payload.message) {
          msg = this.normalizeMessage(payload.message);
        }
      } else if (exception.message) {
        msg = exception.message;
      }
    }

    return { code, msg, data: null };
  }

  private normalizeMessage(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).join('; ');
    }
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value ?? '');
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { STATUS_CODES } from 'http';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error =
      STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR] ?? 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      error = STATUS_CODES[statusCode] ?? 'Error';
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        const body = payload as { message?: string | string[]; error?: string };
        if (typeof body.message === 'string' || Array.isArray(body.message)) {
          message = body.message;
        }
        if (typeof body.error === 'string') {
          error = body.error;
        }
      }
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
    });
  }
}

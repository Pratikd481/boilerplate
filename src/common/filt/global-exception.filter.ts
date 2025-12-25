import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseException } from '../error/base-exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode: status,
      message: 'Internal server error',
    };

    if (exception instanceof BaseException) {
      status = exception.statusCode;
      errorResponse = {
        statusCode: exception.statusCode,
        message: exception.message,
        error: exception.error,
        details: exception.details,
      };
    } else if (exception instanceof BadRequestException) {
      // Check BadRequestException before HttpException (more specific)
      status = exception.getStatus();
      const res = exception.getResponse();
      errorResponse = {
        statusCode: status,
        message: 'Validation failed',
        errors: typeof res === 'object' ? (res as any).message : res,
      };
    } else if (exception instanceof HttpException) {
      // Check HttpException after BadRequestException
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        errorResponse = {
          statusCode: status,
          message: res,
        };
      } else if (typeof res === 'object') {
        errorResponse = {
          statusCode: status,
          ...res,
        };
      }
    } else if (exception instanceof Error) {
      errorResponse = {
        statusCode: status,
        message: exception.message,
      };
    }

    response.status(status).json(errorResponse);
  }
}

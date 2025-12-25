import { HttpStatus } from '@nestjs/common';

export class BaseException extends Error {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly error?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: string,
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.details = details;
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { SERIALIZE_KEY } from '../decorators/serialize.decorator';

@Injectable()
export class SerializeInterceptor implements NestInterceptor<any, any> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const dto = this.reflector.get(SERIALIZE_KEY, context.getHandler()) || this.reflector.get(SERIALIZE_KEY, context.getClass());
    if (!dto) return next.handle();

    return next.handle().pipe(
      map((data) => {
        if (!data) return data;

        // Paginated shape
        if (typeof data === 'object' && 'items' in data && 'meta' in data) {
          return {
            items: plainToInstance(dto, data.items, { excludeExtraneousValues: true }),
            meta: data.meta,
          };
        }

        // Array of items
        if (Array.isArray(data)) {
          return plainToInstance(dto, data, { excludeExtraneousValues: true });
        }

        // Single object
        return plainToInstance(dto, data, { excludeExtraneousValues: true });
      }),
    );
  }
}

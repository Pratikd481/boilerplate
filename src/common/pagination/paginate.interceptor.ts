import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Expects service methods to return either:
 * - an array (non-paginated), or
 * - an object { items: T[], total: number, page: number, limit: number }
 *
 * Transforms paginated result into standardized format:
 * { items, meta: { total, page, limit, totalPages } }
 */
@Injectable()
export class PaginateInterceptor<T>
  implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'total' in data &&
          'page' in data &&
          'limit' in data
        ) {
          const { items, total, page, limit } = data as any;
          const totalPages = Math.ceil(total / limit);
          return { items, meta: { total, page, limit, totalPages } };
        }

        // Not paginated
        return data;
      }),
    );
  }
}

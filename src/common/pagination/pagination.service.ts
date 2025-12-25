import { Injectable } from '@nestjs/common';

import { Paginated, PaginationMeta } from './paginated.interface';

export interface PaginateOptions {
  page?: number;
  limit?: number;
  where?: any;
  select?: any;
  orderBy?: any;
}

@Injectable()
export class PaginationService {
  /**
   * Generic paginate helper for Prisma-like findMany + count
   * - delegate must provide findMany and count methods (e.g. prisma.user)
   * Returns a standardized { items, meta } shape
   */
  async paginate<T>(
    delegate: any,
    options: PaginateOptions = {},
  ): Promise<Paginated<T>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      delegate.findMany({
        where: options.where,
        select: options.select,
        orderBy: options.orderBy,
        skip,
        take: limit,
      }),
      delegate.count({ where: options.where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = { page, limit, total, totalPages };

    return { items, meta };
  }
}

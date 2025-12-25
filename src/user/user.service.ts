import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationService } from '../common/pagination/pagination.service';
import { Paginated } from '../common/pagination/paginated.interface';

@Injectable()
export class UserService {
    private readonly userSelect = {
        id: true,
        uuid: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
    } as const;

    constructor(private prisma: PrismaService, private paginationService: PaginationService) { }

    async findAll(page?: number, limit?: number): Promise<Paginated<any>> {
        // If page/limit not provided return a paginated shape with all items (consistent return type)
        if (!page || !limit) {
            const items = await this.prisma.user.findMany({ select: this.userSelect });
            const total = items.length;
            const meta = { page: 1, limit: items.length, total, totalPages: total > 0 ? 1 : 0 };
            return { items, meta };
        }

        const paginated = await this.paginationService.paginate<any>(
            this.prisma.user,
            {
                page,
                limit
            },
        );

        return paginated;
    }

    async findById(id: number) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findByEmail(email: string) {
        // Keep returning only public fields here; for auth you should use prisma directly where passwordHash is required
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}

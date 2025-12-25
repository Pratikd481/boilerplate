import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';
import { PaginationService } from '../common/pagination/pagination.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: Partial<Record<string, any>>;
  let paginationService: Partial<Record<string, any>>;

  const users = [
    { id: 1, uuid: 'uuid-1', email: 'a@example.com' },
    { id: 2, uuid: 'uuid-2', email: 'b@example.com' },
  ];

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue(users),
        count: jest.fn().mockResolvedValue(2),
      },
      userSubject: {
        findMany: jest.fn(),
      },
    };

    paginationService = {
      paginate: jest.fn().mockResolvedValue({ items: users, meta: { total: 2, page: 1, limit: 10, totalPages: 1 } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: PaginationService, useValue: paginationService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('returns all users when pagination params not provided', async () => {
    const res = await service.findAll();
    expect(prisma.user.findMany).toHaveBeenCalledWith({ select: {
      id: true,
      uuid: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    } });
    expect(res).toEqual({ items: users, meta: { total: 2, page: 1, limit: 2, totalPages: 1 } });
  });

  it('returns paginated result when page/limit provided', async () => {
    const res = await service.findAll(1, 10);
    expect(paginationService.paginate).toHaveBeenCalledWith(prisma.user, { page: 1, limit: 10, select: {
      id: true,
      uuid: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    } });
    expect(res).toEqual({ items: users, meta: { total: 2, page: 1, limit: 10, totalPages: 1 } });
  });
});
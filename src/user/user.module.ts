import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../database/prisma.service';
import { PaginationService } from '../common/pagination/pagination.service';

@Module({
  providers: [UserService, PrismaService, PaginationService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  providers: [SubjectService, PrismaService],
  exports: [SubjectService],
})
export class SubjectModule {}

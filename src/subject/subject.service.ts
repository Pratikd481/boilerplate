import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subject.findMany();
  }

  async findById(id: number) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async findStudentsBySubjectId(subjectId: number) {
    const students = await this.prisma.userSubject.findMany({
      where: { subjectId },
      include: { user: true },
    });
    if (!students || students.length === 0) throw new NotFoundException('No students found for subject');
    return students;
  }
}

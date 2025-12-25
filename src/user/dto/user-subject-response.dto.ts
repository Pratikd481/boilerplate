import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude, Type } from 'class-transformer';

@Exclude()
export class SubjectResponseDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: 'Subject database ID',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: 'subject-uuid-123',
    description: 'Subject unique identifier (UUID)',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: 'Mathematics',
    description: 'Subject name',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: '2025-12-25T12:00:00Z',
    description: 'Subject creation timestamp',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    example: '2025-12-25T12:00:00Z',
    description: 'Subject last update timestamp',
  })
  updatedAt: Date;
}

@Exclude()
export class UserSubjectResponseDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: 'User-Subject relation ID',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  userId: number;

  @Expose()
  @ApiProperty({
    example: 1,
    description: 'Subject ID',
  })
  subjectId: number;

  @Expose()
  @Type(() => SubjectResponseDto)
  @ApiProperty({
    type: SubjectResponseDto,
    description: 'Subject details',
  })
  subject: SubjectResponseDto;

  @Expose()
  @ApiProperty({
    example: '2025-12-25T12:00:00Z',
    description: 'Enrollment creation timestamp',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    example: '2025-12-25T12:00:00Z',
    description: 'Enrollment last update timestamp',
  })
  updatedAt: Date;
}

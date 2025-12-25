import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Exclude()
  @ApiProperty({
    example: 1,
    description: 'User database ID',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User unique identifier (UUID)',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @Expose()
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    nullable: true,
  })
  name: string | null;

  @Expose()
  @ApiProperty({
    example: true,
    description: 'User active status',
  })
  isActive: boolean;

  @Expose()
  @ApiProperty({
    example: '2025-12-25T12:00:00Z',
    description: 'User creation timestamp',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    example: '2025-12-25T12:00:00Z',
    description: 'User last update timestamp',
  })
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'SecurePassword123',
        description: 'User password (minimum 8 characters)',
        minLength: 8,
    })
    @MinLength(8)
    password: string;
}

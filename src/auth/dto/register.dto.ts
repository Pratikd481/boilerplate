import { IsEmail, isString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
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

    @ApiProperty({
        example: 'John Doe',
        description: 'Full name of the user',
    })
    name: string;
}

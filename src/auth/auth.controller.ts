import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { GetCurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUser } from 'src/common/types/current-user.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Creates a new user account with email and password',
    })
    @ApiBody({
        type: RegisterDto,
        description: 'User registration credentials',
    })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
        schema: {
            example: {
                uuid: '550e8400-e29b-41d4-a716-446655440000',
                email: 'user@example.com',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input or user already exists',
    })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto.email, registerDto.password);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Login user',
        description:
            'Authenticates user with email and password, returns access and refresh tokens',
    })
    @ApiBody({
        type: LoginDto,
        description: 'User login credentials',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
    })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Refresh access token',
        description:
            'Generates a new access token using a valid refresh token (implements token rotation)',
    })
    @ApiBody({
        schema: {
            example: {
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },
        description: 'Refresh token from previous login',
    })
    @ApiResponse({
        status: 200,
        description: 'Token refreshed successfully',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid or expired refresh token',
    })
    async refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refresh(refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Logout user',
        description: 'Revokes all refresh tokens for the authenticated user',
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged out',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - missing or invalid token',
    })
    async logout(@GetCurrentUser() currentUser) {
        await this.authService.logout(currentUser.id);
        return { message: 'Logged out successfully' };
    }
}

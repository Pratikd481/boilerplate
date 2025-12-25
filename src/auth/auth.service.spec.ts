import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenUtil } from './utils/token.util';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../database/prisma.service';

jest.mock('argon2');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let service: AuthService;
    let prisma: jest.Mocked<PrismaService>;
    let tokenUtil: jest.Mocked<TokenUtil>;
    let configService: jest.Mocked<ConfigService>;

    const mockUser = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$test$hash',
    };

    const mockRefreshToken = {
        id: 1,
        userId: 1,
        uuid: 'token-uuid-123',
        tokenHash: '$argon2id$v=19$m=65536,t=3,p=4$hash$refresh',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                        },
                        refreshToken: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            updateMany: jest.fn(),
                        },
                    },
                },
                {
                    provide: TokenUtil,
                    useValue: {
                        signAccessToken: jest.fn(),
                        signRefreshToken: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
        tokenUtil = module.get(TokenUtil) as jest.Mocked<TokenUtil>;
        configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should hash password and create user', async () => {
            const email = 'newuser@example.com';
            const password = 'SecurePassword123';
            const passwordHash = '$argon2id$hashed';

            (argon2.hash as jest.Mock).mockResolvedValue(passwordHash);
            prisma.user.create.mockResolvedValue({
                uuid: mockUser.uuid,
                email,
            } as any);

            const result = await service.register(email, password);

            expect(argon2.hash).toHaveBeenCalledWith(password);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: { email, passwordHash },
                select: { uuid: true, email: true },
            });
            expect(result).toEqual({ uuid: mockUser.uuid, email });
        });

        it('should throw error if user creation fails', async () => {
            (argon2.hash as jest.Mock).mockResolvedValue('hashed');
            prisma.user.create.mockRejectedValue(
                new Error('User already exists'),
            );

            await expect(
                service.register('user@example.com', 'password123'),
            ).rejects.toThrow();
        });
    });

    describe('login', () => {
        it('should return tokens on successful login', async () => {
            const password = 'SecurePassword123';
            const mockTokens = {
                accessToken: 'access-token-jwt',
                refreshToken: 'refresh-token-jwt',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser as any);
            (argon2.verify as jest.Mock).mockResolvedValue(true);
            prisma.refreshToken.create.mockResolvedValue(mockRefreshToken as any);
            (argon2.hash as jest.Mock).mockResolvedValue(mockRefreshToken.tokenHash);
            prisma.refreshToken.update.mockResolvedValue(mockRefreshToken as any);
            tokenUtil.signAccessToken.mockReturnValue(mockTokens.accessToken);
            tokenUtil.signRefreshToken.mockReturnValue(mockTokens.refreshToken);

            const result = await service.login(mockUser.email, password);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: mockUser.email },
            });
            expect(argon2.verify).toHaveBeenCalledWith(
                mockUser.passwordHash,
                password,
            );
            expect(result).toEqual(mockTokens);
        });

        it('should throw UnauthorizedException if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(
                service.login('nonexistent@example.com', 'password123'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            prisma.user.findUnique.mockResolvedValue(mockUser as any);
            (argon2.verify as jest.Mock).mockResolvedValue(false);

            await expect(
                service.login(mockUser.email, 'wrongpassword'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('refresh', () => {
        it('should return new tokens with token rotation', async () => {
            const refreshToken = 'valid-refresh-token';
            const mockPayload = {
                sub: mockUser.id,
                jti: mockRefreshToken.uuid,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 604800,
            };
            const mockNewTokens = {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            };

            configService.get.mockReturnValue('JWT_REFRESH_SECRET');
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken as any);
            (argon2.verify as jest.Mock).mockResolvedValue(true);
            prisma.refreshToken.update.mockResolvedValue(mockRefreshToken as any);
            prisma.refreshToken.create.mockResolvedValue(mockRefreshToken as any);
            (argon2.hash as jest.Mock).mockResolvedValue(mockRefreshToken.tokenHash);
            tokenUtil.signAccessToken.mockReturnValue(mockNewTokens.accessToken);
            tokenUtil.signRefreshToken.mockReturnValue(mockNewTokens.refreshToken);

            const result = await service.refresh(refreshToken);

            expect(jwt.verify).toHaveBeenCalledWith(
                refreshToken,
                'JWT_REFRESH_SECRET',
            );
            expect(prisma.refreshToken.update).toHaveBeenCalledWith({
                where: { id: mockRefreshToken.id },
                data: { revoked: true },
            });
            expect(result).toEqual(mockNewTokens);
        });

        it('should throw UnauthorizedException if token is invalid', async () => {
            configService.get.mockReturnValue('JWT_REFRESH_SECRET');
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(
                service.refresh('invalid-token'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if refresh token not found', async () => {
            const mockPayload = { sub: 1, jti: 'non-existent-jti' };

            configService.get.mockReturnValue('JWT_REFRESH_SECRET');
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            prisma.refreshToken.findUnique.mockResolvedValue(null);

            await expect(
                service.refresh('valid-jwt-but-no-db-record'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if token is revoked', async () => {
            const mockPayload = {
                sub: mockUser.id,
                jti: mockRefreshToken.uuid,
            };
            const revokedToken = { ...mockRefreshToken, revoked: true };

            configService.get.mockReturnValue('JWT_REFRESH_SECRET');
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            prisma.refreshToken.findUnique.mockResolvedValue(revokedToken as any);

            await expect(
                service.refresh('revoked-token'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if token has expired in database', async () => {
            const mockPayload = {
                sub: mockUser.id,
                jti: mockRefreshToken.uuid,
            };
            const expiredToken = {
                ...mockRefreshToken,
                expiresAt: new Date(Date.now() - 1000),
            };

            configService.get.mockReturnValue('JWT_REFRESH_SECRET');
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            prisma.refreshToken.findUnique.mockResolvedValue(expiredToken as any);

            await expect(
                service.refresh('expired-token'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should revoke all user tokens on replay detection', async () => {
            const mockPayload = {
                sub: mockUser.id,
                jti: mockRefreshToken.uuid,
            };

            configService.get.mockReturnValue('JWT_REFRESH_SECRET');
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken as any);
            (argon2.verify as jest.Mock).mockResolvedValue(false); // Invalid hash = replay

            await expect(
                service.refresh('replayed-token'),
            ).rejects.toThrow(UnauthorizedException);

            expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                where: { userId: mockUser.id },
                data: { revoked: true },
            });
        });
    });

    describe('logout', () => {
        it('should revoke all refresh tokens for user', async () => {
            prisma.refreshToken.updateMany.mockResolvedValue({ count: 3 } as any);

            await service.logout(mockUser.id);

            expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                where: { userId: mockUser.id },
                data: { revoked: true },
            });
        });

        it('should handle logout when user has no tokens', async () => {
            prisma.refreshToken.updateMany.mockResolvedValue({ count: 0 } as any);

            await service.logout(999);

            expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                where: { userId: 999 },
                data: { revoked: true },
            });
        });
    });
});

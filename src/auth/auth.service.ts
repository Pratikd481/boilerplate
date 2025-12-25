import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../database/prisma.service';
import { TokenUtil } from './utils/token.util';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private tokenUtil: TokenUtil, private configService: ConfigService) { }

    async register(email: string, password: string) {
        const passwordHash = await argon2.hash(password);
        return this.prisma.user.create({
            data: { email, passwordHash },
            select: { uuid: true, email: true },
        });
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException();

        const valid = await argon2.verify(user.passwordHash, password);
        if (!valid) throw new UnauthorizedException();

        return this.issueTokens(user);
    }

    private async issueTokens(user: any) {
        const tokenRecord = await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                tokenHash: '', 
            },
        });

        const refreshToken = this.tokenUtil.signRefreshToken(user.id, tokenRecord.uuid);
        const tokenHash = await argon2.hash(refreshToken);

        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { tokenHash },
        });

        const jwtPayload: JwtPayload = {
            sub: user.id,
            uuid: user.uuid,
            email: user.email,
            jti: tokenRecord.uuid,
        };

        return {
            accessToken: this.tokenUtil.signAccessToken(jwtPayload),
            refreshToken,
        };
    }

    // REFRESH TOKEN ROTATION
    async refresh(refreshToken: string) {
        let payload: any;

        try {
            payload = jwt.verify(refreshToken, this.configService.get<string>('JWT_REFRESH_SECRET'));
        } catch {
            throw new UnauthorizedException();
        }

        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { uuid: payload.jti },
            include: { user: true },
        });

        if (!tokenRecord || tokenRecord.revoked || !tokenRecord.tokenHash) {
            throw new UnauthorizedException();
        }

        // Check if token has expired in database
        if (tokenRecord.expiresAt < new Date()) {
            throw new UnauthorizedException();
        }

        const valid = await argon2.verify(tokenRecord.tokenHash, refreshToken);
        if (!valid) {
            // replay detected → revoke all tokens
            await this.prisma.refreshToken.updateMany({
                where: { userId: payload.sub },
                data: { revoked: true },
            });
            throw new UnauthorizedException();
        }

        //ROTATE: revoke old
        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revoked: true },
        });

        // issue new pair
        return this.issueTokens(tokenRecord.user);
    }

    async logout(userId: number) {
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { revoked: true },
        });
    }
}

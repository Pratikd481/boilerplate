
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'src/common/types/jwt-payload.type';

export class TokenUtil {
    constructor(private readonly config: ConfigService) { }

    signAccessToken(payload: JwtPayload): string {
        return jwt.sign(
            payload,
            this.config.get<string>('JWT_ACCESS_SECRET'),
            {
                algorithm: 'HS256',
                expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES'),
            },
        );
    }

    signRefreshToken(userId: number, tokenUuid: string): string {
        return jwt.sign(
            {
                sub: userId,
                jti: tokenUuid,
            },
            this.config.get<string>('JWT_REFRESH_SECRET'),
            {
                algorithm: 'HS256',
                expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES'),
            },
        );
    }

    verifyAccess<T>(token: string): T {
        return jwt.verify(
            token,
            this.config.get<string>('JWT_ACCESS_SECRET'),
        ) as T;
    }

    verifyRefresh<T>(token: string): T {
        return jwt.verify(
            token,
            this.config.get<string>('JWT_REFRESH_SECRET'),
        ) as T;
    }
}

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { CurrentUser } from 'src/common/types/current-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
            algorithms: ['HS256'],
        });
    }

    validate(payload: JwtPayload): CurrentUser {
        return {
            id: payload.sub,
            uuid: payload.uuid,
            email: payload.email,
        } as CurrentUser;
    }
}

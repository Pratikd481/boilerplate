import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenUtil } from './utils/token.util';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: TokenUtil,
            useFactory: (config: ConfigService) => new TokenUtil(config),
            inject: [ConfigService],
        },
        AuthService,
        JwtStrategy
    ],
    exports: [TokenUtil],
})
export class AuthModule { }

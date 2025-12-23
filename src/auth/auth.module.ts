import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports: [
        ConfigModule, // Add this to ensure ConfigService is available
        PrismaModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<any>('JWT_SECRET'),
                signOptions: { 
                    expiresIn: configService.get<any>('JWT_EXPIRES_IN') || '15m' 
                }
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtStrategy, PassportModule, JwtModule], // Export JwtModule too
})
export class AuthModule {}
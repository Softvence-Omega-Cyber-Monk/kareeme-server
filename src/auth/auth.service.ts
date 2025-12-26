import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterClientDto } from "./dto/register-client.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async registerClient(dto: RegisterClientDto) {
        // Check if email already exists
        const existingClient = await this.prisma.client.client.findUnique({
            where: { email: dto.email }
        });

        if (existingClient) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const hashed = await bcrypt.hash(dto.password, 10);

        // Create client
        const client = await this.prisma.client.client.create({
            data: {
                fullName: dto.fullName,
                email: dto.email,
                password: hashed,
                phoneNumber: dto.phoneNumber,
            },
            select: {
                clientId: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                profileImageUrl: true,
                role: true,
                createdAt: true,
            }
        });

        // Generate tokens
        const tokens = await this.generateTokens(client.clientId, client.email);

        return {
            ...tokens,
            user: client
        };
    }

    async login(dto: LoginDto) {
        // Find user by email
        const client = await this.prisma.client.client.findUnique({
            where: { email: dto.email }
        });

        if (!client) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, client.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate tokens
        const tokens = await this.generateTokens(client.clientId, client.email);

        return {
            ...tokens,
            user: {
                clientId: client.clientId,
                email: client.email,
                fullName: client.fullName,
                phoneNumber: client.phoneNumber,
                profileImageUrl: client.profileImageUrl,
                role: client.role,
            }
        };
    }

    async refreshToken(dto: RefreshTokenDto) {
        try {
            // Verify refresh token
            const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // Check if user still exists
            const client = await this.prisma.client.client.findUnique({
                where: { clientId: payload.sub }
            });

            if (!client) {
                throw new UnauthorizedException('User not found');
            }

            // Generate new tokens
            const tokens = await this.generateTokens(client.clientId, client.email);

            return {
                ...tokens,
                user: {
                    clientId: client.clientId,
                    email: client.email,
                    fullName: client.fullName,
                    phoneNumber: client.phoneNumber,
                    profileImageUrl: client.profileImageUrl,
                    role: client.role,
                }
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async getUserProfile(clientId: string) {
        try {
            console.log('Fetching profile for clientId:', clientId); // Debug log

            const user = await this.prisma.client.client.findUnique({
                where: { clientId },
                select: {
                    clientId: true,
                    email: true,
                    fullName: true,
                    phoneNumber: true,
                    profileImageUrl: true,
                    role: true,
                    isNewReleaseAlertsOn: true,
                    isEarningAlertsOn: true,
                    isPlatformUpdatesOn: true,
                    defaultDistributionPlatforms: true,
                    defaultGenres: true,
                    distributionTerritorys: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            console.log('User found:', user ? 'Yes' : 'No'); // Debug log

            if (!user) {
                throw new NotFoundException('User not found');
            }

            return user;
        } catch (error) {
            console.error('Error in getUserProfile:', error); // Debug log
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new NotFoundException('Unable to fetch user profile');
        }
    }

    private async generateTokens(clientId: string, email: string) {
        const payload = { sub: clientId, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<any>('JWT_SECRET') || 'your-secret-key-here',
                expiresIn: this.configService.get<any>('JWT_EXPIRES_IN') || '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<any>('JWT_REFRESH_SECRET') || 'your-secret-key-here',
                expiresIn: this.configService.get<any>('JWT_REFRESH_EXPIRES_IN') || '7d',
            }),
        ]);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
}
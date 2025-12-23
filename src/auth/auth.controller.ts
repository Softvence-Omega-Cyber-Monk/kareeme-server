import { Body, Controller, Post, HttpCode, HttpStatus, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterClientDto } from "./dto/register-client.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { User } from "./user.decorator";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Register a new client',
        description: 'Creates a new client account with the provided information. Returns access token, refresh token, and user details.'
    })
    @ApiBody({ type: RegisterClientDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Client successfully registered',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    clientId: '9c54d3b8-0c2c-4ec6-a893-1c5c208b5952',
                    fullName: 'Amitav Roy Chowdhury',
                    email: 'client@gmail.com',
                    phoneNumber: '+1234567890',
                    profileImageUrl: null,
                    role: 'CLIENT',
                    createdAt: '2024-12-23T10:00:00.000Z'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - validation failed',
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Conflict - email already exists',
    })
    async register(@Body() dto: RegisterClientDto) {
        return this.authService.registerClient(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Login with email and password',
        description: 'Authenticates a client using email and password. Returns access token, refresh token, and user details.'
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully logged in',
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - validation failed',
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - invalid credentials',
    })
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Refresh access token',
        description: 'Generates a new access token and refresh token using a valid refresh token.'
    })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Tokens successfully refreshed',
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - invalid or expired refresh token',
    })
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth') // Match the name from main.ts
    @ApiOperation({ 
        summary: 'Get current user profile',
        description: 'Returns the profile information of the currently authenticated user.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User profile retrieved successfully',
        schema: {
            example: {
                clientId: '9c54d3b8-0c2c-4ec6-a893-1c5c208b5952',
                email: 'client@gmail.com',
                fullName: 'Amitav Roy Chowdhury',
                phoneNumber: '+1234567890',
                profileImageUrl: null,
                role: 'CLIENT',
                isNewReleaseAlertsOn: true,
                isEarningAlertsOn: true,
                isPlatformUpdatesOn: true,
                defaultDistributionPlatforms: [],
                defaultGenres: [],
                distributionTerritorys: [],
                createdAt: '2024-12-23T10:00:00.000Z',
                updatedAt: '2024-12-23T10:00:00.000Z'
            }
        }
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - invalid or missing access token',
    })
    async getProfile(@User() user: any) {
        console.log('Controller - User from decorator:', user); // Debug log
        return this.authService.getUserProfile(user.clientId);
    }
}
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegisterClientDto {
    @ApiProperty({
        example: 'Amitav Roy Chowdhury',
        description: 'Full name of the client',
    })
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({
        example: 'client@gmail.com',
        description: 'Email of the client',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Password of the client',
    })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({
        example: '+1234567890',
        description: 'Phone number of the client',
    })
    @IsNotEmpty()
    phoneNumber: string;
}
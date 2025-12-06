import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({
        example: 'user@gmail.com',
        description: 'Email of the user',
    })
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Password of the user',
    })
    @IsNotEmpty()
    @IsString()
    password: string;    
}
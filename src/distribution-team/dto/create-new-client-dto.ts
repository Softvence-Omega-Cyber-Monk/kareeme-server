import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class createNewClientDto {

    @IsNotEmpty()
    @IsString()
    readonly fullName: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    readonly role: string;


    @IsNotEmpty()
    @IsString()
    readonly password: string

}
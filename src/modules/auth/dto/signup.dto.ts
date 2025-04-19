import { IsEmail, IsNotEmpty, IsString, IsArray, IsNumber, MinLength, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly password: string;

  @IsNumber()
  @IsOptional()
  tenantId?: string

  @IsArray()
  @IsOptional()
  roles?: string[]
}
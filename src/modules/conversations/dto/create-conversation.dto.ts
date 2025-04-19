import { IsString, IsNotEmpty, IsOptional, IsArray } from "class-validator"

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsArray()
  @IsOptional()
  participants?: string[]
}
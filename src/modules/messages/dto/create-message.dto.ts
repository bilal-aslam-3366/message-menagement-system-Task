import { IsString, IsNotEmpty, IsOptional,  IsObject } from "class-validator"

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string

  @IsString()
  @IsNotEmpty()
  senderId: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>
}

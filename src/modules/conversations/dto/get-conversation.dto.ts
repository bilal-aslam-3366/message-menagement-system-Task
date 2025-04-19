import { IsString, IsNotEmpty } from "class-validator"

export class GetConversationDto {
  @IsString()
  @IsNotEmpty()
  id: string
}

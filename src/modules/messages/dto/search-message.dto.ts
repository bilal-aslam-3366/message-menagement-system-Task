import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from "class-validator"
import { Type } from "class-transformer"

export class SearchMessageDto {
  @IsString()
  @IsNotEmpty()
  q: string

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  pageNo?: number = 1

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 10
}

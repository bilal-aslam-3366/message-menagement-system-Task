import { Controller, Post, Get, Body, Param, UseGuards, Request, Logger } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { ConversationsService } from "./conversations.service"
import { CreateConversationDto } from "./dto/create-conversation.dto"
import { GetConversationDto } from "./dto/get-conversation.dto"

@Controller("conversations")
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  private readonly logger = new Logger(ConversationsController.name)

  constructor(private readonly conversationsService: ConversationsService) {}

  @Post("/")
  @UseGuards(JwtAuthGuard)
  async createConversation(@Body() createConversationDto: CreateConversationDto, @Request() req) {
    this.logger.log("Creating new conversation")
    return this.conversationsService.createConversation(createConversationDto, req.user)
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getConversation(@Param() getConversationDto: GetConversationDto, @Request() req) {
    this.logger.log(`Getting conversation: ${getConversationDto.id}`);
    return this.conversationsService.getConversation(getConversationDto.id);
  }
}

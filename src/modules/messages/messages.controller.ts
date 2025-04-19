import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, Logger } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { MessagesService } from "./messages.service"
import { CreateMessageDto } from "./dto/create-message.dto"
import { SearchMessageDto } from "./dto/search-message.dto"

@Controller()
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name)

  constructor(private readonly messagesService: MessagesService) {}

  @Post("messages")
  @UseGuards(JwtAuthGuard)
  async createMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.messagesService.createMessage(createMessageDto, req.user)
  }

  @Get("conversations/:conversationId/messages")
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('pageNo') pageNo: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('sort') sort: string = '-timestamp',
    @Request() req,
  ) {
    this.logger.log(`Getting messages for conversation: ${conversationId}`)
    return this.messagesService.getMessagesByConversationId(conversationId, { pageNo, pageSize, sort }, req.user)
  }

  @Get("conversations/:conversationId/messages/search")
  @UseGuards(JwtAuthGuard)
  async searchMessages(
    @Param('conversationId') conversationId: string,
    @Query() searchDto: SearchMessageDto,
    @Request() req,
  ) {
    this.logger.log(`Searching messages for conversation: ${conversationId}, query: ${searchDto.q}`)
    return this.messagesService.searchMessages(conversationId, searchDto, req.user)
  }
}

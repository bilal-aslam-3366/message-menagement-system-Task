import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import type { CreateConversationDto } from "./dto/create-conversation.dto"
import type { GetConversationDto } from "./dto/get-conversation.dto"
import { Conversation } from "./schemas/conversation.schema";
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name)

  constructor(
      @InjectModel(Conversation.name)
      private readonly conversationModel: Model<Conversation>,
      private configService: ConfigService,
    ) {}
  

  // In a real application, this would be stored in a database
  private conversations = []

  async createConversation(createConversationDto: CreateConversationDto, user: any) {
    try {
      const existing = await this.conversationModel.findOne({ title: createConversationDto.title });
      if (existing) {
        throw new ConflictException('A conversation with this title already exists');
      }

      const conversation = await this.conversationModel.create({
        title: createConversationDto.title,
        participants: createConversationDto.participants || [user.id],
        createdBy: user._id,
        timestamp: new Date(),
      });

      return conversation
    } catch (error) {
      this.logger.error(`Error creating conversation: ${error.message}`, error.stack)
      throw error
    }
  }

  async getConversation(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid conversation ID format');
      }
  
      const conversation = await this.conversationModel.findById(id).exec();
  
      if (!conversation) {
        throw new NotFoundException(`Conversation with ID ${id} not found`);
      }
  
      return conversation;
    } catch (error) {
      this.logger.error(`Error getting conversation: ${error.message}`, error.stack);
      throw error;
    }
  }
}

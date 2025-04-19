import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ConversationsController } from "./conversations.controller"
import { ConversationsService } from "./conversations.service"
import { Conversation, ConversationSchema } from "./schemas/conversation.schema"
import { AuthModule } from "../auth/auth.module"

@Module({
  imports: [MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]), AuthModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}

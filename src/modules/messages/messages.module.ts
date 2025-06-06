import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { Message, MessageSchema } from "./schemas/message.schema";
import { Conversation, ConversationSchema } from "../conversations/schemas/conversation.schema";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { AuthModule } from "../auth/auth.module";
import { KafkaModule } from "../../common/kafka/kafka.module"; 
import { ElasticsearchModule } from '../../common/elastic/elasticsearch.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: User.name, schema: UserSchema },
    ]),    
    AuthModule,
    ConfigModule,
    KafkaModule,
    ElasticsearchModule
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}

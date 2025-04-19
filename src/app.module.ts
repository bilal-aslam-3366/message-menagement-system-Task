import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './modules/messages/messages.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { DatabaseModule } from './common/database/database.module';
import { KafkaAdminService } from './common/kafka/admin.service';  
import { KafkaProducerService } from './common/kafka/producer.service'; 
import { KafkaConsumerService } from './common/kafka/consumer.service';
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
        dbName: configService.get<string>('DB_NAME'),
      }),
    }),

    // Custom MongoDB context for logging
    DatabaseModule,

    // Application Modules
    AuthModule,
    ConversationsModule,
    MessagesModule
  ],
  controllers: [AppController],
  providers: [AppService, KafkaAdminService, KafkaProducerService, KafkaConsumerService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly kafkaAdminService: KafkaAdminService,
    private readonly kafkaConsumerService: KafkaConsumerService,
  ) {}

  async onModuleInit() {
    // Check Kafka status and create topics on startup
    await this.kafkaAdminService.checkKafkaStatus();
    await this.kafkaAdminService.createTopics();

    // Start the Kafka consumer to listen for response messages
    this.kafkaConsumerService.consumeMessages();
  }
}

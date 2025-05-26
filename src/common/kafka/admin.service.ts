import { Injectable, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaAdminService {
  private readonly logger = new Logger(KafkaAdminService.name);
  private kafka;
  private admin;

 constructor(private readonly configService: ConfigService) {
  const brokersRaw = this.configService.get('kafka.brokers') ?? 'localhost:9092';
  const brokers = typeof brokersRaw === 'string' ? brokersRaw.split(',') : ['localhost:9092'];

  this.logger.log(`Connecting to Kafka brokers: ${brokers.join(', ')}`);

  this.kafka = new Kafka({
    clientId: this.configService.get<string>('kafka.clientId') || 'message-menagement',
    brokers,
  });

  this.admin = this.kafka.admin();
}
  // constructor(private readonly configService: ConfigService) {
  //   this.kafka = new Kafka({
  //     clientId: this.configService.get<string>('kafka.clientId') || 'message-menagement',
  //     brokers: [this.configService.get<string>('kafka.brokers') || 'localhost:9092'],
  //   });
  //   this.admin = this.kafka.admin();
  // }

  async createTopics(retries = 5, delay = 5000) {
    const requestTopic = this.configService.get<string>('kafka.kafkaRequestTopic') || 'kafka_topic_for_request_message';
    const responseTopic = this.configService.get<string>('kafka.kafkaResponseTopic') || 'kafka_topic_for_response_message';

    try {
      await this.admin.connect();
      await this.admin.createTopics({
        topics: [
          { topic: requestTopic, numPartitions: 1, replicationFactor: 1 },
          { topic: responseTopic, numPartitions: 1, replicationFactor: 1 },
        ],
      });
      this.logger.log('Kafka topics created successfully');
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(`Error creating Kafka topics. Retrying in ${delay / 1000} seconds...`);
        await this.sleep(delay);
        await this.createTopics(retries - 1, delay);  // Retry logic
      } else {
        this.logger.error('Failed to create Kafka topics after multiple attempts', error);
      }
    } finally {
      await this.admin.disconnect();
    }
  }

  // Retry delay function
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check Kafka service status and log if it's down
  async checkKafkaStatus() {
    try {
      await this.admin.connect();
      this.logger.log('Kafka service is running');
      await this.admin.disconnect();
    } catch (error) {
      this.logger.error('Kafka service is down');
    }
  }
}

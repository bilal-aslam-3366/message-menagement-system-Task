import { Injectable, Logger } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaConsumerService {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka = new Kafka({
    clientId: 'message-menagement',
    brokers: ['localhost:9092'], 
  });
  private consumer: Consumer;

  async consumeMessages() {
    this.consumer = this.kafka.consumer({ groupId: 'message-group' });

    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'kafka_topic_for_response_message', fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          this.logger.log(`Received message: ${message.value.toString()}`);
        },
      });

      this.logger.log('Kafka consumer is running');
    } catch (error) {
      this.logger.error('Error connecting Kafka consumer', error);
    }
  }
}

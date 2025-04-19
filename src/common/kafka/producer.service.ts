import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka = new Kafka({
    clientId: 'message-menagement',
    brokers: ['localhost:9092'],
  });
  private producer = this.kafka.producer();

  // To manage connection state
  private isConnected = false;

  async connectProducer() {
    try {
      if (!this.isConnected) {
        await this.producer.connect();
        this.isConnected = true;
        this.logger.log('Kafka Producer connected');
      }
    } catch (error) {
      this.logger.error('Error connecting Kafka Producer', error);
      throw new Error('Failed to connect to Kafka');
    }
  }

  async produceMessage(topic: string, message: any) {
    try {
      // Ensure the producer is connected before sending messages
      await this.connectProducer();
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      this.logger.log(`Message sent to ${topic}`);
    } catch (error) {
      this.logger.error(`Error producing message to ${topic}`, error);
    }
  }

  async onModuleDestroy() {
    // Disconnect producer on module shutdown
    if (this.isConnected) {
      try {
        await this.producer.disconnect();
        this.isConnected = false;
        this.logger.log('Kafka Producer disconnected');
      } catch (error) {
        this.logger.error('Error disconnecting Kafka Producer', error);
      }
    }
  }
}

import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from "./schemas/message.schema";
import { CreateMessageDto } from "./dto/create-message.dto";
import { SearchMessageDto } from "./dto/search-message.dto";
import { KafkaProducerService } from '../../common/kafka/producer.service';
import { ElasticContext } from '../../common/elastic/elastic.context';
import { ConfigService } from '@nestjs/config';
import { getFromCache, setCache } from '../../common/redis/redis-helper';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly kafkaProducerService: KafkaProducerService,
    private configService: ConfigService,
    private elasticContext: ElasticContext,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, user: any) {
    try {
      const message = await this.messageModel.create({
        conversationId: createMessageDto.conversationId,
        senderId: user._id,
        content: createMessageDto.content,
        timestamp: new Date(),
        metadata: createMessageDto.metadata || {},
      });

      const kafkaRequestTopic = this.configService.get<string>('kafka.kafkaRequestTopic') || 'kafka_topic_for_request_message';

      //Produce message to Kafka topic
      await this.kafkaProducerService.produceMessage(kafkaRequestTopic, message);

      this.logger.log(`Message created and sent to Kafka topic.`);

      return message;
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMessagesByConversationId(
    conversationId: string,
    options: { pageNo?: number; pageSize?: number; sort?: string },
    user: any,
  ) {
    try {
      const cacheKey = `messages:${conversationId}`;
      const cached = await getFromCache(cacheKey);
  
      const { pageNo = 1, pageSize = 10, sort = '-timestamp' } = options;
      const skip = (pageNo - 1) * pageSize;
  
      if (cached) {
        this.logger.log(`Cache hit for ${conversationId}`);
  
        let cachedMessages: any[] = JSON.parse(cached);
  
        // Optional: sort cached messages (if needed, depending on how you cache them)
        if (sort) {
          const sortField = sort.replace(/^-/, '');
          const sortOrder = sort.startsWith('-') ? -1 : 1;
          cachedMessages = cachedMessages.sort((a, b) => {
            return sortOrder * ((a[sortField] ?? 0) - (b[sortField] ?? 0));
          });
        }
  
        const paginatedData = cachedMessages.slice(skip, skip + pageSize);
        const total = cachedMessages.length;
  
        if (paginatedData.length === 0) {
          throw new NotFoundException(`No messages found for conversation: ${conversationId}`);
        }
  
        return {
          totalElements: total,
          pageNo,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          data: paginatedData,
        };
      }
  
      // If not cached, fetch from DB
      const query = { conversationId };
  
      const [messages, total] = await Promise.all([
        this.messageModel
          .find(query)
          .sort(sort)
          .lean()
          .exec(),
        this.messageModel.countDocuments(query).exec(),
      ]);
  
      if (messages.length === 0) {
        throw new NotFoundException(`No messages found for conversation: ${conversationId}`);
      }
  
      // Cache the full list for future paginations
      await setCache(cacheKey, messages);
  
      const paginatedData = messages.slice(skip, skip + pageSize);
  
      return {
        totalElements: total,
        pageNo,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        data: paginatedData,
      };
    } catch (error) {
      this.logger.error(`Error getting messages: ${error.message}`, error.stack);
      throw error;
    }
  }

  async searchMessages(conversationId: string, searchDto: SearchMessageDto, user: any) {
    const { q, pageNo = 1, pageSize = 10 } = searchDto;
  
    try {
      return await this.searchMessagesInElasticsearch(conversationId, q, pageNo, pageSize, user);
    } catch (error) {
      this.logger.warn(
        `Elasticsearch failed for message search. Falling back to MongoDB: ${error.message}`
      );
      return this.searchMessagesInMongoDB(conversationId, q, pageNo, pageSize, user);
    }
  }
  
  async searchMessagesInElasticsearch(
    conversationId: string,
    query: string,
    pageNo: number,
    pageSize: number,
    user: any,
  ) {
    try {
      const indexName = this.configService.get<string>("elasticsearch.indexMessages");
      const from = (pageNo - 1) * pageSize;
  
      const esQuery = {
        index: indexName,
        from,
        size: pageSize,
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    content: {
                      query,
                      operator: "and",
                    },
                  },
                },
                {
                  term: {
                    conversationId,
                  },
                },
              ]
            },
          },
          sort: [
            {
              timestamp: {
                order: "desc",
              },
            },
          ],
        },
      };
  
      const response = await this.elasticContext.client.search(esQuery as any);
      const hits = response.hits.hits.map((hit) => hit._source);
  
      if (hits.length === 0) {
        throw new NotFoundException(`No messages found for search query: ${query}`);
      }
  
      return {
        data: hits,
        meta: {
          total: typeof response.hits.total === 'number' ? response.hits.total : response.hits.total.value,
          page: pageNo,
          limit: pageSize,
          pages: Math.ceil(
            (typeof response.hits.total === 'number' ? response.hits.total : response.hits.total.value) / pageSize
          ),
        },
      };
      
    } catch (error) {
      this.logger.error(`Error searching messages in Elasticsearch: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  private async searchMessagesInMongoDB(
    conversationId: string,
    searchText: string,
    pageNo: number,
    pageSize: number,
    user: any,
  ) {
    try {
      const skip = (pageNo - 1) * pageSize;
  
      const query = {
        conversationId,
        content: { $regex: searchText, $options: "i" },
      };
  
      const [messages, total] = await Promise.all([
        this.messageModel
          .find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean()
          .exec(),
        this.messageModel.countDocuments(query).exec(),
      ]);
  
      if (messages.length === 0) {
        throw new NotFoundException(`No messages found for search query: ${searchText}`);
      }
  
      return {
        totalElements: total,
        pageNo,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        data: messages,
      
      };
    } catch (error) {
      this.logger.error(`Error in MongoDB search: ${error.message}`, error.stack);
      throw error;
    }
  }
}

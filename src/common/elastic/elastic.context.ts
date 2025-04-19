import { Injectable, type OnModuleInit, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Client } from "@elastic/elasticsearch"

@Injectable()
export class ElasticContext implements OnModuleInit {
  private readonly logger = new Logger(ElasticContext.name)
  public readonly client: Client

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get<string>("elasticsearch.node"),
    })
  }

  async onModuleInit() {
    try {
      const info = await this.client.info()
      this.logger.log(`Elasticsearch connected: ${info}`)

      // Create message index if it doesn't exist
      const indexName = this.configService.get<string>("elasticsearch.indexMessages")
      const indexExists = await this.client.indices.exists({ index: indexName })

      if (!indexExists) {
        await this.createMessageIndex(indexName)
        this.logger.log(`Created Elasticsearch index: ${indexName}`)
      }
    } catch (error) {
      this.logger.error("Failed to connect to Elasticsearch", error.stack)
      // Don't throw error to allow app to start without Elasticsearch
      this.logger.warn("Application will start without Elasticsearch search capabilities")
    }
  }

  private async createMessageIndex(indexName: string) {
    await this.client.indices.create({
      index: indexName,
      body: {
        settings: {
          number_of_shards: 3,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              message_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase", "stop", "snowball"],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: "keyword" },
            conversationId: { type: "keyword" },
            senderId: { type: "keyword" },
            content: {
              type: "text",
              analyzer: "message_analyzer",
              fields: {
                keyword: {
                  type: "keyword",
                  ignore_above: 256,
                },
              },
            },
            timestamp: { type: "date" },
            metadata: { type: "object", enabled: true },
            tenantId: { type: "keyword" },
          },
        },
      },
    } as any)
    
    // await this.client.indices.create({
    //   index: indexName,
    //   body: {
    //     settings: {
    //       number_of_shards: 3,
    //       number_of_replicas: 1,
    //       analysis: {
    //         analyzer: {
    //           message_analyzer: {
    //             type: "custom",
    //             tokenizer: "standard",
    //             filter: ["lowercase", "stop", "snowball"],
    //           },
    //         },
    //       },
    //     },
    //     mappings: {
    //       properties: {
    //         id: { type: "keyword" },
    //         conversationId: { type: "keyword" },
    //         senderId: { type: "keyword" },
    //         content: {
    //           type: "text",
    //           analyzer: "message_analyzer",
    //           fields: {
    //             keyword: {
    //               type: "keyword",
    //               ignore_above: 256,
    //             },
    //           },
    //         },
    //         timestamp: { type: "date" },
    //         metadata: { type: "object", enabled: true },
    //         tenantId: { type: "keyword" },
    //       },
    //     },
    //   },
    // })
  }
}

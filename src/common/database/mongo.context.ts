import { Injectable, type OnModuleInit, Logger } from "@nestjs/common"
import { InjectConnection } from "@nestjs/mongoose"
import type { Connection } from "mongoose"

@Injectable()
export class MongoContext implements OnModuleInit {
  private readonly logger = new Logger(MongoContext.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    try {
      // Check connection
      if (this.connection.readyState === 1) {
        this.logger.log("MongoDB connection established")
      } else {
        this.logger.warn("MongoDB connection not ready")
      }
    } catch (error) {
      this.logger.error("Failed to connect to MongoDB", error.stack)
      throw error
    }
  }
}

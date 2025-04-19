import { Module } from '@nestjs/common';
import { MongoContext } from './mongo.context';

@Module({
  providers: [MongoContext],
})
export class DatabaseModule {}

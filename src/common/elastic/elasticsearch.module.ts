import { Module } from '@nestjs/common';
import { ElasticContext } from './elastic.context';

@Module({
  providers: [ElasticContext],
  exports: [ElasticContext],
})
export class ElasticsearchModule {}

export default () => ({
    port: Number.parseInt(process.env.PORT, 10) || 3000,
    database: {
      uri: process.env.DB_URI,
      dbName: process.env.DB_NAME,
    },
    elasticsearch: {
      node: process.env.ELASTICSEARCH_NODE,
      indexMessages: process.env.ELASTICSEARCH_INDEX_MESSAGES,
    },
    kafka: {
      brokers: process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"],
      clientId: process.env.KAFKA_CLIENT_ID,
      groupId: process.env.KAFKA_GROUP_ID,
      kafkaRequestTopic: process.env.KAFKA_REQUEST_TOPIC,
      kafkaResponseTopic: process.env.KAFKA_RESPONSE_TOPIC
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: Number.parseInt(process.env.REDIS_PORT, 10) || 6379,
      ttl: Number.parseInt(process.env.REDIS_TTL, 10) || 1800,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: Number.parseInt(process.env.JWT_EXPIRATION, 10) || 3600,
    },
  })
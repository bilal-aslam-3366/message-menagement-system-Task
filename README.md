# NestJS Message Management System

A complete RESTful API for managing messages and conversations, built using NestJS, MongoDB, Kafka, Redis, and Elasticsearch. This project is part of a technical task and demonstrates practical use of modern backend technologies and architecture patterns.

## What I Implemented

This system was designed from scratch with a strong focus on scalability, performance, and modular architecture. Here's a breakdown of what I accomplished:

- **Modular NestJS Application** using Domain-Driven Design (DDD) and Event-Driven Architecture (EDA).
- **JWT-based Authentication and Role-based Authorization**.
- **MongoDB Integration** for storing messages and conversations with efficient Mongoose schemas.
- **Kafka Integration**:
  - Producer: Emits events when a message is created.
  - Consumer: Listens for events and handles Elasticsearch indexing.
- **Elasticsearch Setup** for full-text search functionality over messages.
- **Redis Caching**:
  - Caches message data on retrieval by `conversationId`.
  - Checks Redis first before hitting the database.

- **Multi-Tenant Support**:
  - All operations are scoped by tenant ID to ensure clean separation of data.
- **Clean Project Structure** with reusable components and shared infrastructure in `/common`.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com)
- **Database**: MongoDB with Mongoose
- **Message Broker**: Kafka
- **Search Engine**: Elasticsearch
- **Caching Layer**: Redis
- **Authentication**: JWT
- **Real-time**: Socket.io (WebSockets)
- **Architecture**: DDD, EDA, SOLID principles

## How to Run

### Prerequisites

Make sure the following services are installed and running on localhost:

- Node.js (v18+)
- MongoDB   
- Kafka + Zookeeper   <localhost:9092>
- Elasticsearch       <localhost:9200>
- Redis               <localhost:6379>

### Clone and Setup

```bash
git clone https://github.com/yourusername/nestjs-message-system.git
cd nestjs-message-system
npm install
npm run start:dev

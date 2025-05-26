import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Conversation } from "../../conversations/schemas/conversation.schema"; 
import { User } from "../../auth/schemas/user.schema"; 

export type MessageDocument = Message & Document;

@Schema({
  timestamps: true,
  collection: "messages",
})
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true, index: true })
  conversationId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Add indexes for efficient querying
MessageSchema.index({ conversationId: 1, timestamp: -1 });
MessageSchema.index({ senderId: 1, timestamp: -1 });
MessageSchema.index({ content: "text" });

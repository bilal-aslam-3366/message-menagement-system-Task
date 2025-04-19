import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: "conversations"
})
export class Conversation extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ default: ["bilal", "ali"] })
  participants: string[];

  @Prop({ required: true, index: true })
  createdBy: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// index the columns for queries optimization
ConversationSchema.index({ title: 1 }, { unique: true });
ConversationSchema.index({ createdBy: 1 });
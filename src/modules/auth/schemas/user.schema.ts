import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: "users"
})
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ unique: [true, 'Duplicate email entered'] })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 1 })
  tenantId: number;

  @Prop({ default: ["user"] })
  roles: string[]
}

export const UserSchema = SchemaFactory.createForClass(User);

// index the columns for queries optimization
UserSchema.index({ username: 1 }, { unique: true })
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ tenantId: 1 })
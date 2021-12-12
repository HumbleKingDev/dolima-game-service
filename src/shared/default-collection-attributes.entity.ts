/* eslint-disable prettier/prettier */
import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DefaultAttributesDocument = DefaultAttributes & Document;

@Schema()
export class DefaultAttributes {
  @Prop({ required: true, type: String, unique: true })
  code: string;

  @Prop({ required: true, type: Date })
  createdAt: Date;

  @Prop({ required: true, type: Date })
  lastUpdatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

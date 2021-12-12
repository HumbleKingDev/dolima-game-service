/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { Players } from '../players/players.entity';
import { Games } from './games.entity';

export enum EGiftState {
  DEFAULT = 'DEFAULT',
  WAITING_TO_WIN = 'WAITING_TO_WIN',
  WON = 'WON',
}
export type GiftDocument = Gift & Document;

@Schema()
export class Gift {
  @Prop({ type: String, required: true, unique: true })
  code: string;
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  giftNumber: number;

  @Prop({ type: String, enum: EGiftState, default: 'DEFAULT' })
  state: EGiftState;

  @Prop({ type: Types.ObjectId, default: null, ref: 'Players' })
  player: Players | Types.ObjectId;

  @Prop({ type: Date, default: null })
  from: Date;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Games' })
  game: Games | Types.ObjectId;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);

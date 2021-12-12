/* eslint-disable prettier/prettier */
import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { Players } from '../players/players.entity';

export type WinnerEntityDocument = WinnerEntity & Document;

@Schema({ _id: false })
export class WinnerEntity {
  @Prop({ type: Number, required: true })
  playerNumber: number;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Players' })
  player: Players;

  @Prop({ type: Date, required: true })
  from: Date;

  @Prop({ type: Number, required: true })
  giftNumber: number;
}

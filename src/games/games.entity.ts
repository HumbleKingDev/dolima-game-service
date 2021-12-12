/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { Players } from '../players/players.entity';
import { DefaultAttributes } from '../shared/default-collection-attributes.entity';
import { Gift } from './gift.entity';
import { WinnerEntity } from './winner.entity'

export type GamesDocument = Games & Document;

@Schema()
export class Games extends DefaultAttributes {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Number, required: true })
  expectedWinners: number;

  @Prop({ type: [Types.ObjectId], default: [], ref: 'Gift' })
  gifts: Gift[];

  @Prop({ type: Number, default: 0 })
  lastPlayerNumber: number;

  @Prop({ type: [Types.ObjectId], ref: 'Players', default: [] })
  registeredPlayers: Players[];

  @Prop({ type: [Types.ObjectId], ref: 'Players', default: [] })
  players: Players[];

  @Prop({ type: [], default: [] })
  watingToWin: WinnerEntity[];

  @Prop({ type: [], default: [] })
  winners: WinnerEntity[];
  
  @Prop({ type: Boolean, default: false })
  allGiftWon: boolean;

  @Prop({ type: Boolean, default: false })
  isOver: boolean;
}

export const GamesSchema = SchemaFactory.createForClass(Games);

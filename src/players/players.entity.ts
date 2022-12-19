/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { Games } from '../games/games.entity';
import { GamesPlayerEntity } from './games-played.entity';

export type PlayersDocument = Players & Document;

@Schema()
export class Players {
  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true, unique: true })
  phoneNumber: string;

  @Prop({ type: String, default: ""})
  email: string;

  @Prop({ type: String, default: '' })
  additionalInfos: string;

  @Prop({ type: [], default: [] })
  gamesPlayed: GamesPlayerEntity[];
  
  @Prop({ type: [], default: [] })
  gamesRegistered: GamesPlayerEntity[];

  @Prop({ type: [Types.ObjectId], ref: 'Games', default: [] })
  gamesWon: Games[];
}

export const PlayersSchema = SchemaFactory.createForClass(Players);

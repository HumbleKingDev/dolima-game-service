/* eslint-disable prettier/prettier */
import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { Games } from '../games/games.entity';

export type GamesPlayerEntityDocument = GamesPlayerEntity & Document;

@Schema({ _id: false })
export class GamesPlayerEntity {
  @Prop({ type: Number, required: true })
  playerNumber: number;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Games' })
  game: Games;
}

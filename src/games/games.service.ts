/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { stringToDate } from '../helpers/date.helper';
import { codeGenerator, ErrorMessages } from '../helpers/main-helper';
import { fail, Result, succeed } from '../helpers/response-helper';
import { NewGameDto, UpdateGameDto } from './games.dto';
import { Games, GamesDocument } from './games.entity';
import { EGiftState, Gift, GiftDocument } from './gift.entity';

const PopulateOptions = [
  { path: 'players', select: '-_id -__v -gamesWon -gamesPlayed ' },
];

interface IGiftUpdate {
  state: EGiftState;
  player: Types.ObjectId;
  from: Date;
}

interface IWinner {
  playerNumber: number;
  player: Types.ObjectId;
  giftNumber: number;
  from: Date;
}
@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Games.name) private readonly model: Model<GamesDocument>,
    @InjectModel(Gift.name) private readonly giftModel: Model<GiftDocument>,
  ) {}

  async findAll(): Promise<Result> {
    try {
      return succeed({
        data:
          (await this.model
            .find({ isDeleted: false }, '-_id -__v')
            .lean()
            .populate(PopulateOptions)) || [],
      });
    } catch (error) {
      throw new HttpException(
        ErrorMessages.ERROR_GETTING_DATA,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(newGame: NewGameDto): Promise<Result> {
    try {
      if (newGame.gifts.length !== newGame.expectedWinners) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `The number of gifts must be equal to the number of expected winners.`,
          error: 'Bad request',
        });
      }
      const creationDate = new Date();
      const startDate = stringToDate(newGame.startDate);
      const endDate = stringToDate(newGame.endDate);
      if (!this.__isValidIntervallDate(startDate, endDate)) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `Game's date interval is incorrect.`,
          error: 'Bad request',
        });
      }
      const game = {
        code: codeGenerator('GAM'),
        name: newGame.name,
        description: newGame.description,
        startDate: startDate,
        endDate: endDate,
        expectedWinners: newGame.expectedWinners,
        createdAt: creationDate,
        lastUpdatedAt: creationDate,
      };
      const createdGame = await this.model.create(game);
      const gameGifts = newGame.gifts.map((gift, index) => ({
        code: codeGenerator('GIF'),
        name: gift,
        giftNumber: index + 1,
        game: createdGame._id.toString(),
      }));
      const createdGifts = await this.__createGifts(gameGifts);
      createdGame.gifts = createdGifts.flatMap((gift) => gift._id);
      await createdGame.save();
      return succeed({
        code: HttpStatus.CREATED,
        data: game,
        message: 'New game successfully created',
      });
    } catch (error) {
      if (error?.code === 11000) {
        throw new HttpException(
          `Please check if there is not already a game with the same name: ${newGame.name} `,
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          `Error while creating new game. Try again.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findOne(code: string): Promise<Result> {
    try {
      const game = await this.model
        .findOne({ code }, '-_id -__v')
        .lean()
        .populate(PopulateOptions);
      if (!game)
        return fail({
          error: `Not Found`,
          code: HttpStatus.NOT_FOUND,
          message: `Game with code: ${code} not found`,
        });
      else return succeed({ data: game });
    } catch (error) {
      throw new HttpException(
        ErrorMessages.ERROR_GETTING_DATA,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(code: string, updateGame: UpdateGameDto): Promise<Result> {
    try {
      const game = await this.model.findOne({ code });
      if (!game) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: `Game's with code ${code} not found.`,
          error: 'Not Found',
        });
      }
      const oldExpectedWinners = game.expectedWinners;
      game.name = updateGame.name || game.name;
      game.description = updateGame.description || game.description;
      game.expectedWinners = updateGame.expectedWinners || game.expectedWinners;
      //check oldExpectedWinners
      game.startDate = updateGame.startDate
        ? stringToDate(updateGame.startDate)
        : game.startDate;
      game.endDate = updateGame.endDate
        ? stringToDate(updateGame.endDate)
        : game.endDate;
      if (!this.__isValidIntervallDate(game.startDate, game.endDate)) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `Game's date interval is incorrect.`,
          error: 'Bad request',
        });
      }
      game.lastUpdatedAt = new Date();
      await game.save();
      return succeed({
        code: HttpStatus.OK,
        message: 'Game updated!',
        data: {
          code: game.code,
          name: game.name,
          description: game.description,
          startDate: game.startDate,
          endDate: game.endDate,
          expectedWinners: game.expectedWinners,
        },
      });
    } catch (error) {
      console.log({ error });
      if (error?.code === 11000) {
        throw new HttpException(
          `Please check if there is not already a game with the same name: ${updateGame.name} `,
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          `Error while updating game. Try again.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async __createGifts(gifts: any[]) {
    return await this.giftModel.insertMany(gifts);
  }

  async __updateGiftState(code: string, gift: IGiftUpdate) {
    const query = { code };
    const update = { ...gift };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return await this.giftModel.findOneAndUpdate(query, update, options);
  }

  private __isValidIntervallDate(start: Date, end: Date) {
    return end > start;
  }

  async __findByCode(code: string) {
    return await this.model.findOne({ code });
  }

  async __findByCodeWithGifts(code: string) {
    return await this.model.findOne({ code }).populate('gifts');
  }

  /** Register a player for a game */
  async __addToRegisteredPlayer(idGame: string, playerId: string) {
    return await this.model.findByIdAndUpdate(idGame, {
      $addToSet: {
        registeredPlayers: playerId,
      },
    });
  }

  /**Add user to game's players */
  async __addToPlayer(idGame: string, playerId: string) {
    return await this.model.findByIdAndUpdate(idGame, {
      $addToSet: {
        players: playerId,
      },
    });
  }

  /**Add user to game's winners */
  async __addToWinner(idGame: string, winner: IWinner) {
    return await this.model.findByIdAndUpdate(idGame, {
      $addToSet: {
        winners: winner,
      },
    });
  }

  async __getNextPlayerNumber(code: string) {
    const game = await this.model.findOne({ code });
    game.lastPlayerNumber += 1;
    await game.save();
    return game.lastPlayerNumber;
  }

  async __addToWaitingWinner(
    gameId: string,
    playerNumber: number,
    playerId: string,
  ) {
    await this.__cleanExceeds15minutes(gameId);
    const game = await this.model.findById(gameId).populate('gifts');
    const index = game.gifts.findIndex((gift) => gift.player?.toString() === playerId)
    // const hasAlreadyAGiftToWin = !game.gifts.every((gift) => gift.player?.toString() !== playerId);
    if (index !== -1 ) {
      return {success: true, giftNumber: game.gifts[index].giftNumber};
    }
    const availableGift = game.gifts.findIndex(
      (gift) => gift.state === EGiftState.DEFAULT,
    );
    if (availableGift === -1) {
      return { success: false, giftNumber: 0 };
    }
    const gift = game.gifts[availableGift];
    gift.state = EGiftState.WAITING_TO_WIN;
    gift.player = new Types.ObjectId(playerId);
    gift.from = new Date();

    await this.__updateGiftState(gift.code, {
      player: new Types.ObjectId(playerId),
      state: EGiftState.WAITING_TO_WIN,
      from: new Date(),
    });
    return { success: true, giftNumber: gift.giftNumber };
  }

  async __cleanExceeds15minutes(gameId: string) {
    const currentDate = new Date();
    // const limitDate = new Date(currentDate.getTime() - 5 * 60 * 1000);
    const gifts = await this.giftModel.find({ game: gameId });
    for (const gift of gifts) {
      const result =
        (Math.abs(currentDate.getTime() - gift.from?.getTime()) / (1000 * 60)) %
        60;
      const minutes = parseInt(result.toString());
      if (minutes > 2 && gift.state === EGiftState.WAITING_TO_WIN) {
        await this.__updateGiftState(gift.code, {
          state: EGiftState.DEFAULT,
          player: null,
          from: null,
        });
      }
    }
  }
}

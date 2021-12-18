/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EGiftState } from 'src/games/gift.entity';

import { GamesDocument } from '../games/games.entity';
import { GamesService } from '../games/games.service';
import { ErrorMessages } from '../helpers/main-helper';
import { fail, Result, succeed } from '../helpers/response-helper';
import { ConfirmPlayingDto, ConfirmWinningDto, PlayersDto } from './players.dto';
import { Players, PlayersDocument } from './players.entity';

const PopulateOptions = [];
@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Players.name)
    private readonly model: Model<PlayersDocument>,
    private readonly gameService: GamesService,
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

  async create(newPlayer: PlayersDto): Promise<Result> {
    try {
      const game = await this.gameService.__findByCode(newPlayer.gameInfos);
      if (!game) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `Bad request!`,
          error: 'Bad request!',
        });
      }
      let player = await this.__findByPhoneNumber(newPlayer.phoneNumber);
      let canPlayGame = true;
      if (player) {
        canPlayGame = player.gamesPlayed.every(
          (played) => played.game.toString() !== game._id.toString(),
        );
      }
      if (!canPlayGame) {
        return fail({
          code: HttpStatus.NOT_MODIFIED,
          message: `Vous avez déjà joué à ce jeu.`,
          error: 'Vous avez déjà joué à ce jeu.',
        });
      }
      const oldPlayerNumberInGame = this.__getOldAssignedNumberInGame(
        player,
        game._id.toString(),
      );
      const playerNumber =
        oldPlayerNumberInGame ||
        (await this.gameService.__getNextPlayerNumber(game.code));
      const gamesRegistered: any[] = player?.gamesRegistered || [];

      if (!oldPlayerNumberInGame) {
        gamesRegistered.push({
          playerNumber,
          game: new Types.ObjectId(game._id.toString()),
        });
      }

      const query = {
        phoneNumber: newPlayer.phoneNumber,
      };
      const update = {
        fullName: newPlayer.fullName,
        gamesRegistered: gamesRegistered,
      };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      player = await this.model.findOneAndUpdate(query, update, options);

      await this.gameService.__addToRegisteredPlayer(
        game._id.toString(),
        player._id.toString(),
      );

      const playerCanWin = await this.__playerCanWin(
        playerNumber,
        game.winners.length,
        game.expectedWinners,
      );
      let giftToWin = null;
      if (playerCanWin) {
        giftToWin = await this.gameService.__addToWaitingWinner(
          game._id.toString(),
          playerNumber,
          player._id.toString(),
        );
      }
      return succeed({
        code: HttpStatus.OK,
        message: '',
        data: {
          pcw: giftToWin?.success ? 1 : 0,
          ...(giftToWin?.success && {
            gft: giftToWin?.giftNumber,
          }),
        },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while registering player. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async confirmPlaying(data: ConfirmPlayingDto): Promise<Result> {
    try {
      const player = await this.__findByPhoneNumber(data.phoneNumber);
      if (!player) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: `Player not found`,
          error: 'Not found',
        });
      }
      const game = await this.gameService.__findByCodeWithGifts(data.gameInfos);
      if (!game) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `Bad request`,
          error: '',
        });
      }
      const gameId = game._id.toString();
      const playerId = player._id.toString();

      if (!this.__neverPlayedGame(player, gameId)) {
        return fail({
          code: HttpStatus.NOT_MODIFIED,
          message: `Vous avez déjà joué à ce jeu.`,
          error: 'Vous avez déjà joué à ce jeu.',
        });
      }

      const playerNumber = this.__getOldAssignedNumberInGame(player, gameId);

      if (!playerNumber) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `Bad request`,
          error: 'Bad request',
        });
      }

      const gamesPlayed: any[] = player.gamesPlayed;
      gamesPlayed.push({
        playerNumber,
        game: new Types.ObjectId(gameId),
      });

      await this.gameService.__addToPlayer(gameId, playerId);

      const gamesWon: any[] = player.gamesWon;

      const giftToWin = this.__hasWinningNumber(playerNumber)
        ? this.__hasGiftWaitingToWin(game, playerId)
        : null;

      const from = new Date();

      if (giftToWin) {
        await this.gameService.__updateGiftState(giftToWin.code, {
          state: EGiftState.WON,
          player: player._id,
          from,
        });
        await this.gameService.__addToWinner(game._id.toString(), {
          player: player._id,
          from: null,
          giftNumber: giftToWin.giftNumber,
          playerNumber,
        });
        gamesWon.push(gameId);
      }

      const query = {
        phoneNumber: player.phoneNumber,
      };
      const update = {
        fullName: player.fullName,
        gamesPlayed,
        gamesWon,
      };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      await this.model.findOneAndUpdate(query, update, options);
      const message = giftToWin
        ? `BRAVO  ${player.fullName} Vous êtes l’heureux gagnant de ce lot ! Nous vous contacterons très vite.`
        : "Désolé, vous n'avez pas gagné!";
      return succeed({
        code: HttpStatus.OK,
        message,
        data: {},
      });
    } catch (error) {
      throw new HttpException(
        `Une erreur est survenue. Merci de réssayer.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async confirmWinning(data: ConfirmWinningDto): Promise<Result> {
    try {
      const player = await this.__findByPhoneNumber(data.phoneNumber);
      if (!player) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: `Player not found`,
          error: 'Not found',
        });
      }
      const game = await this.gameService.__findByCodeWithGifts(data.gameInfos);
      if (!game) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: `Game not found`,
          error: 'Not found',
        });
      }
      const index = game.gifts.findIndex(
        (gift) => gift.player?.toString() === player._id.toString(),
      );
      if (index === -1) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `Bad request`,
          error: 'Bad request',
        });
      }
      const from = new Date();
      const gift = game.gifts[index];
      await this.gameService.__updateGiftState(gift.code, {
        state: EGiftState.WON,
        player: player._id,
        from,
      });

      const indexPlayerNumber = player.gamesPlayed.findIndex(
        (played) => played.game.toString() === game._id.toString(),
      );

      const playerNumberInGame =
        player.gamesPlayed[indexPlayerNumber]?.playerNumber;

      await this.gameService.__addToWinner(game._id.toString(), {
        player: player._id,
        from: null,
        giftNumber: gift.giftNumber,
        playerNumber: playerNumberInGame,
      });

      await this.__addToWonGame(player._id.toString(), game._id.toString());
      return succeed({
        code: HttpStatus.OK,
        message: `Congrats ${player.fullName} you win: ${gift.name}!!!`,
        data: {},
      });
    } catch (error) {
      throw new HttpException(
        `Error while confirm player. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async __findByPhoneNumber(phoneNumber: string) {
    return await this.model.findOne({ phoneNumber });
  }

  private __hasWinningNumber(playerNumber: number) {
    return playerNumber % 2 === 0;
  }

  private __hasGiftWaitingToWin(game: GamesDocument, playerId: string) {
    const index = game.gifts.findIndex(
      (gift) => gift.player?.toString() === playerId,
    );

    return game.gifts[index] || null;
  }

  /**Check if the player with number: {playerNumber} can be a winner */
  async __playerCanWin(
    playerNumber: number,
    gameWinners: number,
    expectedWinners: number,
  ) {
    return playerNumber % 200 === 0 && gameWinners < expectedWinners;
  }

  async __addToWonGame(idPlayer: string, idGame: string) {
    return await this.model.findByIdAndUpdate(idPlayer, {
      $addToSet: {
        gamesWon: idGame,
      },
    });
  }

  /**Check if player has never played game. Note that he can be registered. */
  private __neverPlayedGame(player: PlayersDocument, gameId: string) {
    return player.gamesPlayed.every(
      (played) => played.game.toString() !== gameId,
    );
  }

  /**Returns null if player never registered in game.
   * Otherwise, it will return number assigned to player for the first time he was registered for this game
   */
  private __getOldAssignedNumberInGame(
    player: PlayersDocument,
    gameId: string,
  ) {
    if (!player) {
      return null;
    }
    const index = player.gamesRegistered.findIndex(
      (registered) => registered.game.toString() === gameId,
    );
    return player.gamesRegistered[index]?.playerNumber || null;
  }
}

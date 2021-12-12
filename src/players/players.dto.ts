/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';

import { SNPhoneNumberValidator } from '../helpers/players.helper';

export class PlayersDto {
  @IsNotEmpty({ message: `Player's name is required.` })
  @IsString({ message: `Player's name must be string.`})
  fullName: string;

  @IsNotEmpty({ message: `Player's phone number is required.` })
  @IsString({ message: `Player's phone number must be string.`})
  @Validate(SNPhoneNumberValidator)
  phoneNumber: string;

  @IsOptional()
  gameInfos: string;
}

export class ConfirmWinningDto {
  @IsNotEmpty({ message: `Player's phone number is required.` })
  @IsString({ message: `Player's phone number must be string.`})
  @Validate(SNPhoneNumberValidator)
  phoneNumber: string;

  @IsOptional()
  gameInfos: string;
}

export class ConfirmPlayingDto {
  @IsNotEmpty({ message: `Player's phone number is required.` })
  @IsString({ message: `Player's phone number must be string.`})
  @Validate(SNPhoneNumberValidator)
  phoneNumber: string;

  @IsOptional()
  gameInfos: string;
}
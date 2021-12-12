/* eslint-disable prettier/prettier */
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export const isValidGameCode = (code: string) =>
  code && code.includes('GAM-') && code.length === 23;

@ValidatorConstraint({ name: 'GameCodeValidator', async: false })
export class GameCodeValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(code: string, _args: ValidationArguments) {
    return isValidGameCode(code);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Invalid game code.';
  }
}

@ValidatorConstraint({ name: 'GiftsValidator', async: false })
export class GiftsValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(gifts: string[], _args: ValidationArguments) {
    return Array.isArray(gifts) && gifts?.length && gifts.every((gift) => gift.length);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Invalid gifts array.';
  }
}

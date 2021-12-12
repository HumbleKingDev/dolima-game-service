/* eslint-disable prettier/prettier */
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export const isValidSNPhoneNumber = (phoneNumber: string) =>
  /^(221|00221|\+221)?(77|78|75|70|76)[0-9]{7}$/gm.test(phoneNumber);

@ValidatorConstraint({ name: 'SNPhoneNumberValidator', async: false })
export class SNPhoneNumberValidator implements ValidatorConstraintInterface {
  validate(phoneNumber: string, _args: ValidationArguments) {
    return isValidSNPhoneNumber(phoneNumber);
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Invalid phone number.';
  }
}

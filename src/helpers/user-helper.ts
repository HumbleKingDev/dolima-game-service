import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';


export function isValidphoneNumber(phoneNumber: string) {
    let regex = /[7][5-8][\-]\d{3}[\-]\d{2}[\-]\d{2}/;
    if(regex.test(phoneNumber) && phoneNumber.length === 12){
        return true
    }
};

@ValidatorConstraint({ name: 'phoneNumberValidator', async: false })
export class PhoneNumberValidator implements ValidatorConstraintInterface {

  validate(phoneNumber: string, args: ValidationArguments) {
    return isValidphoneNumber(phoneNumber)
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid phone number.';
  }
}
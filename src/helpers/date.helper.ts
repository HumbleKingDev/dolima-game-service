/* eslint-disable prettier/prettier */
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import * as moment from 'moment';

@ValidatorConstraint({ name: 'IsValidDate', async: false })
export class IsValidDate implements ValidatorConstraintInterface {
  validate(value: string) {
    if (typeof value === 'string') {
      return (
        /^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/\-]\d{4}$/.test(
          value,
        ) && moment(value, 'DD/MM/YYYY').isValid()
      );
    }
    return false;
  }

  defaultMessage({ property }) {
    return `${property} must be a valid date (Required format: DD/MM/YYYY)`;
  }
}
/**The date string must be in DD/MM/YYYY Format */
export const stringToDate = (date: string) => {
  const dateParts = date.split('/');
  return new Date(`${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`);
};

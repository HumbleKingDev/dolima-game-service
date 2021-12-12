
const CHARACTERS = 'AZERTYUIOPQSDFGHJKLMWXCVBNazertyuiopqsdfghjklmwxcvbn1234567890';

const generateCode = (length: number) => {
  var code = '';
  for (var i = 0; i < length; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
};

export const codeGenerator = (prefix: string) => `${prefix}-${Date.now().toString()}-${generateCode(5)}`;

export const ErrorMessages = {
  INTERNAL_SERVER_ERROR: 'An internal error has occurred. Please try again',
  ERROR_GETTING_DATA: 'Error while getting data',
  ERROR_CREATING_DATA: 'Error while creating new ',
  REQUIRED_FIELD_ERROR: 'Some required field(s) is (are) not provided.',
};
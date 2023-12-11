import {AbstractControl} from '@angular/forms';

const validateDocument = require('validate-document-ecuador');

export class ValidacionesPropias {

  static rucValido(control: AbstractControl) {
    const valido = validateDocument.getValidateDocument('ruc', control.value);
    let errors = control['errors'] || {};
    if (valido.status === 'SUCCESS') {
      delete errors?.['rucInvalid'];
      return null;
    } else {
      control.setErrors({...errors, rucInvalid: true});
      return {rucInvalid: true};
    }
  }

  static cedulaValido(control: AbstractControl) {
    const valido = validateDocument.getValidateDocument('cedula', control.value);
    let errors = control['errors'] ?? {};
    if (valido.status === 'SUCCESS') {
      delete errors?.['identificacionInvalid'];
      return null;
    } else {
      control.setErrors({...errors, identificacionInvalid: true});
      return {identificacionInvalid: true};
    }
  }
}

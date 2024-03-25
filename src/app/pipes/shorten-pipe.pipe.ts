import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shorten'
})
export class ShortenPipe implements PipeTransform {

  transform(value: string): string {
    // Verificar si el valor es null
    if (value === null) {
      return ''; // o cualquier otro valor predeterminado que desees
    }

    // Verificar si el valor es una cadena y tiene una longitud mayor a 15
    if (typeof value === 'string' && value.length > 15) {
      return value.substr(0, 15) + '...';
    }

    return value; // Devolver el valor original si no necesita ser truncado
  }
}

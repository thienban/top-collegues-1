import { Pipe, PipeTransform } from '@angular/core';
import { Collegue } from '../domain/collegue';

@Pipe({
  name: 'filterByPseudo'
})
export class FilterByPseudoPipe implements PipeTransform {
  transform(value: Collegue[], arg?: string): any {
    if (!arg) {
      return value;
    } else {
      return value.filter(col =>
        col.pseudo.toLowerCase().includes(arg.toLowerCase())
      );
    }
  }
}

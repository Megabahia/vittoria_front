import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {
  private sharedDataSubject = new BehaviorSubject<any>({
    modulo: 'adm',
    seccion: 'index'
  });

  setSharedData(data: any): void {
    this.sharedDataSubject.next(data);
  }

  getSharedData(): Observable<any> {
    return this.sharedDataSubject.asObservable();
  }
}

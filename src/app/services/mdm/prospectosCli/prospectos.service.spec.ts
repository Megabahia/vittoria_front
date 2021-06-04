import { TestBed } from '@angular/core/testing';

import { ListaService } from './prospectos.service';

describe('ListaService', () => {
  let service: ListaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

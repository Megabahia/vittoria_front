import { TestBed } from '@angular/core/testing';

import { GestionOfertaService } from './gestion-oferta.service';

describe('GestionOfertaService', () => {
  let service: GestionOfertaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionOfertaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { GestionEntregaService } from './gestion-entrega.service';

describe('GestionEntregaService', () => {
  let service: GestionEntregaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionEntregaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

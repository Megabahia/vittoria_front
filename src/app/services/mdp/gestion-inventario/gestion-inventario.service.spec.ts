import { TestBed } from '@angular/core/testing';

import { GestionInventarioService } from './gestion-inventario.service';

describe('GestionInventarioService', () => {
  let service: GestionInventarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionInventarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { CaducidadService } from './caducidad.service';

describe('CaducidadService', () => {
  let service: CaducidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaducidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

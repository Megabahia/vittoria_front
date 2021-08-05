import { TestBed } from '@angular/core/testing';

import { NuevosService } from './nuevos.service';

describe('NuevosService', () => {
  let service: NuevosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NuevosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

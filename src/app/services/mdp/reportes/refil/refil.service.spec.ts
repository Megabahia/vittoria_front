import { TestBed } from '@angular/core/testing';

import { RefilService } from './refil.service';

describe('RefilService', () => {
  let service: RefilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RefilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

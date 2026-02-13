import { TestBed } from '@angular/core/testing';

import { EcomFormServiceService } from './ecom-form-service.service';

describe('EcomFormServiceService', () => {
  let service: EcomFormServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EcomFormServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

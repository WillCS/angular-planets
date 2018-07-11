import { TestBed, inject } from '@angular/core/testing';

import { PlanetService } from './planet.service';

describe('PlanetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlanetService]
    });
  });

  it('should be created', inject([PlanetService], (service: PlanetService) => {
    expect(service).toBeTruthy();
  }));
});

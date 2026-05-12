import { TestBed } from '@angular/core/testing';
import { FlightSearchService } from '../app/services/flight-search.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../app/services/auth.service';
import { environment } from '../environments/environment';
import { Flights } from '../app/model/flights';

describe('FlightSearchService', () => {
  let service: FlightSearchService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockToken = 'mock-token';
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FlightSearchService,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(FlightSearchService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authServiceSpy.getToken.and.returnValue(mockToken);
  });

  afterEach(() => {
    httpMock.verify();
  });


  it('should search flights', () => {
    const mockFlights: Flights[] = [{ id: 1, flight_number: 'AI101' } as Flights];

    service.searchFlights('Delhi', 'Mumbai', '2025-08-20').subscribe((flights: Flights[]) => {
      expect(flights.length).toBe(1);
      expect(flights[0].flight_number).toBe('AI101');
    });

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/api/flights/search` &&
      r.params.get('source') === 'Delhi' &&
      r.params.get('destination') === 'Mumbai' &&
      r.params.get('date') === '2025-08-20'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush(mockFlights);
  });

  it('should suggest source cities', () => {
    const mockSources: Flights[] = [
      { id: 1, source: 'Delhi' } as Flights,
      { id: 2, source: 'Mumbai' } as Flights
    ];

    service.suggestCitiesForSource().subscribe((flights: Flights[]) => {
      expect(flights.length).toBe(2);
    });

    const req = httpMock.expectOne(`${baseUrl}/api/flights/source/suggest`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush(mockSources);
  });



});
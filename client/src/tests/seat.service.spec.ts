import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../environments/environment';

describe('HttpService - Seat Methods', () => {
  let service: HttpService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  const mockToken = 'mock-token';
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService, { provide: AuthService, useValue: authSpy }]
    });
    service = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authServiceSpy.getToken.and.returnValue(mockToken);
  });

  afterEach(() => { httpMock.verify(); });

  it('should fetch seats for a flight', () => {
    service.getSeats(1).subscribe(seats => { expect(seats).toBeTruthy(); });
    // FIX: removed trailing slash — actual URL is /seats/flights/1/seats (no slash at end)
    const req = httpMock.expectOne(`${baseUrl}/api/seats/flights/1/seats`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush([{ id: 1, seatNumber: 'A1' }, { id: 2, seatNumber: 'A2' }]);
  });

  it('should book seats via bookSeats method', () => {
    service.bookSeats(1, ['A1', 'A2'], 101).subscribe(res => { expect(res).toBeTruthy(); });
    // FIX: correct endpoint is /api/booking/book-seats (not the old /book)
    const req = httpMock.expectOne(`${baseUrl}/api/booking/book-seats`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ flightId: 1, seatNumbers: ['A1', 'A2'], userId: 101 });
    req.flush({ message: 'Booking Successful' });
  });
});

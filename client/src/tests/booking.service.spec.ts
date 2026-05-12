import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../app/services/auth.service';
import { environment } from '../environments/environment';
import { Bookings } from '../app/model/bookings';
import { BookingsService } from '../app/services/booking.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockToken = 'mock-token';
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BookingsService,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(BookingsService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authServiceSpy.getToken.and.returnValue(mockToken);
  });

  afterEach(() => {
    httpMock.verify();
  });



  it('should book a flight', () => {
    const mockBooking: Bookings = { id: 1, status: 'CONFIRMED' } as Bookings;

    service.bookFlight(1, 'A1').subscribe(booking => {
      expect(booking.status).toBe('CONFIRMED');
    });

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/api/booking/book` &&
      r.params.get('flightId') === '1' &&
      r.params.get('seatNumbers') === 'A1'
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockBooking);
  });

  it('should get all bookings', () => {
    const mockBookings: Bookings[] = [{ id: 1 } as Bookings];

    service.getBookings().subscribe(bookings => {
      expect(bookings.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/api/booking`);

    expect(req.request.method).toBe('GET');
    req.flush(mockBookings);
  });

  it('should get my bookings', () => {
    const mockBookings: Bookings[] = [{ id: 2 } as Bookings];

    service.getMyBookings().subscribe(bookings => {
      expect(bookings.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/api/booking/bookings`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBookings);
  });

  it('should get my bookings list user', () => {
    const mockBookings: Bookings[] = [{ id: 3 } as Bookings];

    service.getMyBookingsListUser().subscribe(bookings => {
      expect(bookings.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/api/booking/bookingList`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBookings);
  });

  it('should check seat availability', () => {
    const seatNumbers = ['A1', 'A2'];

    service.checkSeatAvailability(1, seatNumbers).subscribe(result => {
      expect(result).toBeTrue();
    });

    const req = httpMock.expectOne(`${baseUrl}/api/booking/check-seat-availability?flightId=1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(seatNumbers);
    req.flush(true);
  });

  it('should validate seat availability', () => {
    service.validateSeatAvailability(1, 2).subscribe(result => {
      expect(result).toBeTrue();
    });

    const req = httpMock.expectOne(`${baseUrl}/api/booking/validate-seats?flightId=1&travelerCount=2`);
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

 

  it('should download ticket', () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

    service.downloadTicket(1).subscribe(blob => {
      expect(blob instanceof Blob).toBeTrue();
    });

    const req = httpMock.expectOne(`${baseUrl}/api/booking/ticket/1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });

  it('should update booking status', () => {
    service.updateBookingStatus(1, 'CANCELLED').subscribe(response => {
      expect(response).toEqual({});
    });

    const req = httpMock.expectOne(`${baseUrl}/api/booking/1/status`);

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'CANCELLED' });
    req.flush({});
  });

  it('should book seats', () => {
    const seatNumbers = ['A1', 'A2'];

    service.bookSeats(1, seatNumbers, 101).subscribe(response => {
      expect(response).toEqual({});
    });

    const req = httpMock.expectOne(`${baseUrl}/api/booking/book-seats`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      flightId: 1,
      seatNumbers: seatNumbers,
      userId: 101
    });
    req.flush({});
  });
});

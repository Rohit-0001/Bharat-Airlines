import { TestBed } from '@angular/core/testing';
import { FlightService } from '../app/services/flight.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../app/services/auth.service';
import { environment } from '../environments/environment';
import { Flights } from '../app/model/flights';
import { User } from '../app/model/user';
import { FlightSchedule } from '../app/model/flight-schedule';

describe('FlightService', () => {
  let service: FlightService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockToken = 'mock-token';
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FlightService,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(FlightService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authServiceSpy.getToken.and.returnValue(mockToken);
  });

  afterEach(() => {
    httpMock.verify();
  });

 

  it('should get all flights', () => {
    const mockFlights: Flights[] = [{ id: 1, flight_number: 'AI101' } as Flights];

    service.getAllFlights().subscribe(flights => {
      expect(flights.length).toBe(1);
      expect(flights[0].flight_number).toBe('AI101');
    });

    const req = httpMock.expectOne(`${baseUrl}/api/flights`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFlights);
  });

  it('should search flights', () => {
    const mockFlights: Flights[] = [{ id: 2, flight_number: 'AI202' } as Flights];

    service.searchFlights('Delhi', 'Mumbai', '2025-08-20').subscribe(flights => {
      expect(flights.length).toBe(1);
      expect(flights[0].flight_number).toBe('AI202');
    });

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/api/flights/search` &&
      r.params.get('source') === 'Delhi' &&
      r.params.get('destination') === 'Mumbai' &&
      r.params.get('date') === '2025-08-20'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockFlights);
  });

  it('should create a flight', () => {
    const newFlight: Flights = { id: 3, flight_number: 'AI303' } as Flights;

    service.createFlight(newFlight).subscribe(flight => {
      expect(flight.flight_number).toBe('AI303');
    });

    const req = httpMock.expectOne(`${baseUrl}/api/flights`);
    expect(req.request.method).toBe('POST');
    req.flush(newFlight);
  });

  it('should update a flight', () => {
    const updatedFlight: Flights = { id: 1, flight_number: 'AI101-Updated' } as Flights;

    service.updateFlight(1, updatedFlight).subscribe(flight => {
      expect(flight.flight_number).toBe('AI101-Updated');
    });

    const req = httpMock.expectOne(`${baseUrl}/api/flights/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedFlight);
  });


  it('should assign a pilot', () => {
    service.assignPilot(1, 2, '2025-08-20', 'ASSIGNED').subscribe(response => {
      expect(response).toEqual({});
    });

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/api/pilot/schedule/admin/assign-pilot` &&
      r.params.get('flightId') === '1' &&
      r.params.get('pilotId') === '2' &&
      r.params.get('scheduledDate') === '2025-08-20' &&
      r.params.get('assignStatus') === 'ASSIGNED'
    );
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should get pilots', () => {
    const mockUsers: User[] = [{ id: 1, username: 'Pilot A' } as User];

    service.getPilots().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].username).toBe('Pilot A');
    });

    const req = httpMock.expectOne(`${baseUrl}/api/pilot/schedule/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should get assign pilot details for user', () => {
    const mockSchedules: FlightSchedule[] = [{ id: 1 } as FlightSchedule];

    service.getAssignPilotDetails().subscribe(schedules => {
      expect(schedules.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/api/pilot/schedule/scheduleUser`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSchedules);
  });

  it('should get all assign pilot details', () => {
    const mockSchedules: FlightSchedule[] = [{ id: 2 } as FlightSchedule];

    service.getAllAssignPilotDetails().subscribe(schedules => {
      expect(schedules.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/api/pilot/schedule`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSchedules);
  });

  it('should update flight status', () => {
    service.updateFlightStatus(1, 'Cancelled').subscribe(response => {
      expect(response).toEqual({});
    });

    const req = httpMock.expectOne(`${baseUrl}/api/pilot/schedule/1/status`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'Cancelled' });
    req.flush({});
  });

  it('should check availability', () => {
    service.checkAvailability(1, 3).subscribe(response => {
      expect(response.available).toBeTrue();
    });

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/api/flights/1/check-availability` &&
      r.params.get('travelerCount') === '3'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ available: true });
  });
});

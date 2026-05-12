import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlightComponent } from '../app/component/flight/flight.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('FlightComponent', () => {
  let component: FlightComponent;
  let fixture: ComponentFixture<FlightComponent>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['getAllFlights', 'createFlight']);
    // FIX: getRole is a getter property
    const authSpy = jasmine.createSpyObj('AuthService', [], { getRole: 'ADMIN' });

    await TestBed.configureTestingModule({
      declarations: [FlightComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: HttpService, useValue: httpSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightComponent);
    component = fixture.componentInstance;
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    httpServiceSpy.getAllFlights.and.returnValue(of([]));
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize form and load flights on ngOnInit', () => {
    const mockFlights = [{ id: 1, flight_number: 'AI101' }];
    httpServiceSpy.getAllFlights.and.returnValue(of(mockFlights));
    component.ngOnInit();
    expect(component.flightForm).toBeDefined();
    expect(component.flights.length).toBe(1);
    expect(component.seats.length).toBe(1);
  });

  it('should add a seat to the seats FormArray', () => {
    component.ngOnInit();
    const initialCount = component.seats.length;
    component.addSeat();
    expect(component.seats.length).toBe(initialCount + 1);
  });

  it('should remove a seat from the seats FormArray', () => {
    component.ngOnInit();
    component.addSeat();
    const countBefore = component.seats.length;
    component.removeSeat(0);
    expect(component.seats.length).toBe(countBefore - 1);
  });

  it('should not submit form if invalid and not call createFlight', () => {
    component.ngOnInit();
    component.flightForm.reset();
    component.onSubmit();
    expect(httpServiceSpy.createFlight).not.toHaveBeenCalled();
  });

  it('should call createFlight and show success on valid submit', () => {
    component.ngOnInit();
    httpServiceSpy.createFlight.and.returnValue(of({ id: 1 }));

    // FIX: patch all required top-level fields AND fill the seats FormArray properly
    component.flightForm.patchValue({
      flight_number: 'AI101', flight_name: 'Air India',
      source: 'Delhi', destination: 'Mumbai',
      departureDate: '2025-10-01', departureTime: '10:00',
      arrivalTime: '12:00', totalSeats: 100,
      available_seats: 100, price: 5000, status: 'SCHEDULED'
    });
    // Fill the one seat that addSeat() created in ngOnInit
    component.seats.at(0).patchValue({
      seatNumber: 'A1', rowLabel: 'A', columnNumber: 1, price: 500
    });

    component.onSubmit();
    expect(httpServiceSpy.createFlight).toHaveBeenCalled();
    expect(component.showMessage).toBeTrue();
  });

  it('should set showError when loadFlights fails', () => {
    httpServiceSpy.getAllFlights.and.returnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(component.showError).toBeTrue();
  });
});

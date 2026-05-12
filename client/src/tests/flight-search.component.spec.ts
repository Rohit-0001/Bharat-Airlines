import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlightSearchComponent } from '../app/component/flight-search/flight-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('FlightSearchComponent', () => {
  let component: FlightSearchComponent;
  let fixture: ComponentFixture<FlightSearchComponent>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpService', [
      'suggestSource', 'suggestDestination', 'searchFlights', 'bookSeats', 'getSeats'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['getRole', 'getUserId']);
    authSpy.getUserId.and.returnValue('1');

    await TestBed.configureTestingModule({
      declarations: [FlightSearchComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: HttpService, useValue: httpSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightSearchComponent);
    component = fixture.componentInstance;
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    httpServiceSpy.suggestSource.and.returnValue(of([{ source: 'Delhi' }, { source: 'Mumbai' }]));
    httpServiceSpy.suggestDestination.and.returnValue(of([{ destination: 'Bangalore' }]));
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load source and destination suggestions on ngOnInit', () => {
    component.ngOnInit();
    expect(component.sourceList).toContain('Delhi');
    expect(component.sourceList).toContain('Mumbai');
    expect(component.destinationList).toContain('Bangalore');
  });

  it('should initialize searchForm with default values', () => {
    component.ngOnInit();
    expect(component.searchForm.get('adult')?.value).toBe(1);
    expect(component.searchForm.get('child')?.value).toBe(0);
    expect(component.searchForm.get('infant')?.value).toBe(0);
    expect(component.searchForm.get('travelClass')?.value).toBe('Economy');
  });

  it('should not search if form is invalid', () => {
    component.ngOnInit();
    component.search();
    expect(httpServiceSpy.searchFlights).not.toHaveBeenCalled();
  });

  it('should search flights and populate results on valid form', () => {
    const mockFlights = [{ id: 1, source: 'Delhi', destination: 'Mumbai', price: 5000 }];
    httpServiceSpy.searchFlights.and.returnValue(of(mockFlights));
    component.ngOnInit();
    component.searchForm.setValue({
      source: 'Delhi', destination: 'Mumbai', date: '2025-10-01',
      adult: 1, child: 0, infant: 0, travelClass: 'Economy'
    });
    component.search();
    expect(httpServiceSpy.searchFlights).toHaveBeenCalledWith('Delhi', 'Mumbai', '2025-10-01');
    expect(component.flights.length).toBe(1);
  });

  it('should set selectedFlight and totalPrice when viewFlight is called', () => {
    httpServiceSpy.getSeats.and.returnValue(of([]));
    const flight = { id: 1, price: 5000 };
    component.ngOnInit();
    component.searchForm.patchValue({ adult: 2, child: 1, infant: 0 });
    component.viewFlight(flight);
    expect(component.selectedFlight).toEqual(flight);
    expect(component.totalPrice).toBe(2 * 5000 + 1 * 5000 * 0.75);
  });

  it('should update seatNumbers when onSeatSelected is called', () => {
    component.onSeatSelected('B3');
    expect(component.seatNumbers).toBe('B3');
  });

  it('should increment and decrement traveler count', () => {
    component.ngOnInit();
    component.updateTravelerCount('adult', 1);
    expect(component.searchForm.get('adult')?.value).toBe(2);
    component.updateTravelerCount('adult', -1);
    expect(component.searchForm.get('adult')?.value).toBe(1);
  });

  it('should toggle dropdown open/close', () => {
    expect(component.dropdownOpen).toBeFalse();
    component.toggleDropdown();
    expect(component.dropdownOpen).toBeTrue();
    component.toggleDropdown();
    expect(component.dropdownOpen).toBeFalse();
  });

  it('should call bookSeats and show success message on bookSelectedFlight', () => {
    httpServiceSpy.bookSeats.and.returnValue(of({}));
    httpServiceSpy.getSeats.and.returnValue(of([]));
    component.ngOnInit();
    component.selectedFlight = { id: 1, price: 5000 };
    component.seatNumbers = 'A1';
    component.bookSelectedFlight();
    expect(httpServiceSpy.bookSeats).toHaveBeenCalled();
    expect(component.showMessage).toBeTrue();
  });

  it('should set showError when searchFlights fails', () => {
    httpServiceSpy.searchFlights.and.returnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    component.searchForm.setValue({
      source: 'Delhi', destination: 'Mumbai', date: '2025-10-01',
      adult: 1, child: 0, infant: 0, travelClass: 'Economy'
    });
    component.search();
    expect(component.showError).toBeTrue();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingsComponent } from '../app/component/bookings/bookings.component';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('BookingsComponent', () => {
  let component: BookingsComponent;
  let fixture: ComponentFixture<BookingsComponent>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpService', [
      'getMyBookings', 'updateBookingStatus', 'downloadTicket'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['getRole']);

    await TestBed.configureTestingModule({
      declarations: [BookingsComponent],
      providers: [
        { provide: HttpService, useValue: httpSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingsComponent);
    component = fixture.componentInstance;
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
  });

  it('should create the component', () => {
    httpServiceSpy.getMyBookings.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load bookings on init', () => {
    const mockBookings = [{ id: 1, status: 'CONFIRMED' }, { id: 2, status: 'CANCELLED' }];
    httpServiceSpy.getMyBookings.and.returnValue(of(mockBookings));
    component.ngOnInit();
    expect(httpServiceSpy.getMyBookings).toHaveBeenCalled();
    expect(component.bookings.length).toBe(2);
  });

  it('should set showError to true when loadBookings fails', () => {
    httpServiceSpy.getMyBookings.and.returnValue(throwError(() => new Error('Error')));
    component.loadBookings();
    expect(component.showError).toBeTrue();
    expect(component.errorMessage).toBe('Failed to load bookings.');
  });

  it('should cancel booking and show success message', () => {
    httpServiceSpy.updateBookingStatus.and.returnValue(of({}));
    httpServiceSpy.getMyBookings.and.returnValue(of([]));
    component.cancelBooking(1);
    expect(httpServiceSpy.updateBookingStatus).toHaveBeenCalledWith(1, 'CANCELLED');
    expect(component.showMessage).toBeTrue();
    expect(component.responseMessage).toBe('Booking cancelled successfully.');
  });

  it('should set showError when cancelBooking fails', () => {
    httpServiceSpy.updateBookingStatus.and.returnValue(
      throwError(() => ({ error: { message: 'Cancel failed' } }))
    );
    component.cancelBooking(1);
    expect(component.showError).toBeTrue();
  });

  it('should initialize with empty bookings array', () => {
    httpServiceSpy.getMyBookings.and.returnValue(of([]));
    component.ngOnInit();
    expect(component.bookings.length).toBe(0);
  });
});

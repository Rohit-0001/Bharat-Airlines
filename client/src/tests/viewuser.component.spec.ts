import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewuserComponent } from '../app/component/viewuser/viewuser.component';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('ViewuserComponent', () => {
  let component: ViewuserComponent;
  let fixture: ComponentFixture<ViewuserComponent>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['getAllBookings']);
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      declarations: [ViewuserComponent],
      providers: [
        { provide: HttpService, useValue: httpSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewuserComponent);
    component = fixture.componentInstance;
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
  });

  it('should create the component', () => {
    httpServiceSpy.getAllBookings.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load all bookings on ngOnInit', () => {
    const mockBookings = [
      { id: 1, status: 'CONFIRMED' },
      { id: 2, status: 'CANCELLED' }
    ];
    httpServiceSpy.getAllBookings.and.returnValue(of(mockBookings));
    component.ngOnInit();
    expect(httpServiceSpy.getAllBookings).toHaveBeenCalled();
    expect(component.bookingsListUser.length).toBe(2);
  });

  it('should initialize with empty bookings list', () => {
    httpServiceSpy.getAllBookings.and.returnValue(of([]));
    component.ngOnInit();
    expect(component.bookingsListUser.length).toBe(0);
  });

  it('should set showError and errorMessage when loadBookings fails', () => {
    httpServiceSpy.getAllBookings.and.returnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(component.showError).toBeTrue();
    expect(component.errorMessage).toBe('Failed to load bookings.');
  });

  it('should call loadBookings when ngOnInit is called', () => {
    httpServiceSpy.getAllBookings.and.returnValue(of([]));
    spyOn(component, 'loadBookings').and.callThrough();
    component.ngOnInit();
    expect(component.loadBookings).toHaveBeenCalled();
  });
});

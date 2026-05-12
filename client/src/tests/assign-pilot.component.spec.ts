import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignPilotComponent } from '../app/component/assign-pilot/assign-pilot.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('AssignPilotComponent', () => {
  let component: AssignPilotComponent;
  let fixture: ComponentFixture<AssignPilotComponent>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpService', [
      'getAllFlights', 'getPilots', 'getAllSchedules', 'getMySchedule', 'assignPilot', 'updateScheduleStatus'
    ]);
    // FIX: getRole is a getter property not a method — use createSpyObj with accessors
    const authSpy = jasmine.createSpyObj('AuthService', [], { getRole: 'ADMIN' });

    await TestBed.configureTestingModule({
      declarations: [AssignPilotComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: HttpService, useValue: httpSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignPilotComponent);
    component = fixture.componentInstance;
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    httpServiceSpy.getAllFlights.and.returnValue(of([]));
    httpServiceSpy.getPilots.and.returnValue(of([]));
    httpServiceSpy.getAllSchedules.and.returnValue(of([]));
  });

  it('should initialize form and load data on ngOnInit', () => {
    component.ngOnInit();
    expect(component.roleName).toBe('ADMIN');
    expect(component.assignForm).toBeDefined();
    expect(httpServiceSpy.getAllFlights).toHaveBeenCalled();
    expect(httpServiceSpy.getPilots).toHaveBeenCalled();
    expect(httpServiceSpy.getAllSchedules).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.ngOnInit();
    component.onSubmit();
    expect(httpServiceSpy.assignPilot).not.toHaveBeenCalled();
  });

  it('should update schedule status and reload', () => {
    component.ngOnInit();
    httpServiceSpy.updateScheduleStatus.and.returnValue(of({}));
    component.updateStatus(1, 'ACCEPTED');
    expect(httpServiceSpy.updateScheduleStatus).toHaveBeenCalledWith(1, 'ACCEPTED');
    expect(component.showMessage).toBeTrue();
  });

  it('should show error when updateStatus fails', () => {
    component.ngOnInit();
    httpServiceSpy.updateScheduleStatus.and.returnValue(
      throwError(() => ({ error: { message: 'Failed' } }))
    );
    component.updateStatus(1, 'ACCEPTED');
    expect(component.showError).toBeTrue();
  });
});

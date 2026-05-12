import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeatSelectionComponent } from '../app/component/seat/seat.component';
import { SeatService } from '../app/services/seat.service';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

describe('SeatSelectionComponent', () => {
  let component: SeatSelectionComponent;
  let fixture: ComponentFixture<SeatSelectionComponent>;
  let seatServiceSpy: jasmine.SpyObj<SeatService>;

  const mockSeats = [
    { id: 1, seatNumber: 'A1', rowLabel: 'A', columnNumber: 1, isAvailable: true, isBlocked: false },
    { id: 2, seatNumber: 'A2', rowLabel: 'A', columnNumber: 2, isAvailable: true, isBlocked: false },
    { id: 3, seatNumber: 'B1', rowLabel: 'B', columnNumber: 1, isAvailable: true, isBlocked: false }
  ];

  beforeEach(async () => {
    // FIX: SeatSelectionComponent injects SeatService, not HttpService
    const seatSpy = jasmine.createSpyObj('SeatService', ['getSeats', 'bookSeats']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    authSpy.getToken.and.returnValue('mock-token');

    await TestBed.configureTestingModule({
      declarations: [SeatSelectionComponent],
      providers: [
        { provide: SeatService, useValue: seatSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SeatSelectionComponent);
    component = fixture.componentInstance;
    seatServiceSpy = TestBed.inject(SeatService) as jasmine.SpyObj<SeatService>;
  });

  it('should fetch and create seat map on init', () => {
    // FIX: set flightId before detectChanges so ngOnInit calls loadSeats
    seatServiceSpy.getSeats.and.returnValue(of(mockSeats as any));
    component.flightId = 1;
    fixture.detectChanges(); // triggers ngOnInit → loadSeats()

    expect(seatServiceSpy.getSeats).toHaveBeenCalledWith(1);
    expect(component.seatMap.length).toBe(2);      // 2 rows: A and B
    expect(component.seatMap[0].length).toBe(2);   // Row A: A1, A2
  });

  it('should create seat map from input seats on ngOnChanges', () => {
    component.seats = mockSeats as any;
    component.ngOnChanges({
      seats: { currentValue: mockSeats, previousValue: [], firstChange: false, isFirstChange: () => false }
    });
    expect(component.seatMap.length).toBe(2);
    expect(component.seatMap[0].length).toBe(2);
    expect(component.seatMap[1].length).toBe(1);
  });

  it('should emit selected seat number when seat is not booked', () => {
    const seat = { seatNumber: 'A1', booked: false };
    spyOn(component.seatSelected, 'emit');
    component.selectSeat(seat);
    expect(component.selectedSeatNumber).toBe('A1');
    expect(component.seatSelected.emit).toHaveBeenCalledWith('A1');
  });

  it('should NOT emit when seat is already booked', () => {
    const seat = { seatNumber: 'A2', booked: true };
    spyOn(component.seatSelected, 'emit');
    component.selectSeat(seat);
    expect(component.selectedSeatNumber).toBeNull();
    expect(component.seatSelected.emit).not.toHaveBeenCalled();
  });
});

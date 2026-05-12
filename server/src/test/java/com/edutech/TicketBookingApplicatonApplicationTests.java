package com.edutech;

import com.edutech.entity.*;
import com.edutech.repository.*;
import com.edutech.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

import static org.hamcrest.Matchers.aMapWithSize;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Master Test Suite — 60 test cases
 *
 *  Section 1 : Spring Context Load Test                  (1  test)
 *  Section 2 : BookingValidationService Unit Tests        (4  tests)
 *  Section 3 : BookingService Unit Tests                  (9  tests)
 *  Section 4 : FlightsService Unit Tests                  (10 tests)
 *  Section 5 : FlightScheduleService Unit Tests           (8  tests)
 *  Section 6 : Controller Integration Tests               (28 tests)
 *              Auth (10), Flights (8), Bookings (5), Schedule (3), Global (2)
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TicketBookingApplicatonApplicationTests {

    // ═══════════════════════════════════════════════════════════════════
    // Spring beans (integration tests — Section 6)
    // ═══════════════════════════════════════════════════════════════════
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepositoryBean;
    @Autowired private FlightsRepository flightsRepositoryBean;
    @Autowired private BookingRepository bookingRepositoryBean;
    @Autowired private SeatRepository seatRepositoryBean;
    @Autowired private FlightScheduleRepository flightScheduleRepositoryBean;
    @Autowired private PasswordEncoder passwordEncoder;

    // Shared state for ordered integration tests
    private static String adminToken;
    private static String passengerToken;
    private static String pilotToken;
    private static Long flightId;
    private static Long bookingId;
    private static Long scheduleId;
    private static Long passengerId;
    private static Long pilotId;

    // ═══════════════════════════════════════════════════════════════════
    // Mockito fields (unit tests — Sections 2–5)
    // ═══════════════════════════════════════════════════════════════════

    // -- BookingValidationService
    @InjectMocks private BookingValidationService bookingValidationService;
    @Mock        private SeatRepository seatRepository;

    // -- BookingService
    @InjectMocks private BookingService bookingService;
    @Mock        private BookingRepository bookingRepository;
    @Mock        private FlightsRepository flightsRepository;
    @Mock        private UserRepository userRepository;

    // -- FlightsService
    @InjectMocks private FlightsService flightsService;
    // flightsRepository mock reused above

    // -- FlightScheduleService
    @InjectMocks private FlightScheduleService flightScheduleService;
    @Mock        private FlightScheduleRepository flightScheduleRepositoryMock;
    // flightsRepository and userRepository mocks shared above

    // Shared mock data for unit tests
    private Flights mockFlight;
    private Seat mockSeat1;
    private Seat mockSeat2;
    private User mockPilot;

    // ── Setup ────────────────────────────────────────────────────────────
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Shared mock flight
        mockFlight = new Flights();
        mockFlight.setId(1L);
        mockFlight.setFlight_number("AI101");
        mockFlight.setSource("Delhi");
        mockFlight.setDestination("Mumbai");
        mockFlight.setDepartureDate(LocalDate.of(2025, 8, 20));
        mockFlight.setDepartureTime(LocalTime.of(10, 0));
        mockFlight.setArrivalTime(LocalTime.of(12, 0));
        mockFlight.setAvailable_seats(5);
        mockFlight.setTotalSeats(100);
        mockFlight.setPrice(5000.0);
        mockFlight.setStatus("SCHEDULED");

        // Shared mock seats
        mockSeat1 = new Seat();
        mockSeat1.setId(101L);
        mockSeat1.setSeatNumber("A1");
        mockSeat1.setAvailable(true);
        mockSeat1.setBlocked(false);
        mockSeat1.setFlight(mockFlight);

        mockSeat2 = new Seat();
        mockSeat2.setId(102L);
        mockSeat2.setSeatNumber("A2");
        mockSeat2.setAvailable(true);
        mockSeat2.setBlocked(false);
        mockSeat2.setFlight(mockFlight);

        // Shared mock pilot
        mockPilot = new User();
        mockPilot.setId(1L);
        mockPilot.setUsername("Captain Raj");

        // Create integration test users in DB if not present
        if (userRepositoryBean.findByUsername("admin_test") == null) {
            User admin = new User();
            admin.setUsername("admin_test");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setEmail("admin_test@airline.com");
            admin.setRole(Role.ADMIN);
            userRepositoryBean.save(admin);
        }
        if (userRepositoryBean.findByUsername("passenger_test") == null) {
            User passenger = new User();
            passenger.setUsername("passenger_test");
            passenger.setPassword(passwordEncoder.encode("Pass@123"));
            passenger.setEmail("passenger_test@airline.com");
            passenger.setRole(Role.PASSENGER);
            passengerId = userRepositoryBean.save(passenger).getId();
        } else {
            passengerId = userRepositoryBean.findByUsername("passenger_test").getId();
        }
        if (userRepositoryBean.findByUsername("pilot_test") == null) {
            User pilot = new User();
            pilot.setUsername("pilot_test");
            pilot.setPassword(passwordEncoder.encode("Pilot@123"));
            pilot.setEmail("pilot_test@airline.com");
            pilot.setRole(Role.PILOT);
            pilotId = userRepositoryBean.save(pilot).getId();
        } else {
            pilotId = userRepositoryBean.findByUsername("pilot_test").getId();
        }
    }


    // ═══════════════════════════════════════════════════════════════════
    // SECTION 1 — Spring Context Load Test  (1 test)
    // ═══════════════════════════════════════════════════════════════════

    @Test @Order(1)
    void contextLoads() {
        // Passes if the Spring context starts successfully
    }


    // ═══════════════════════════════════════════════════════════════════
    // SECTION 2 — BookingValidationService Unit Tests  (4 tests)
    // ═══════════════════════════════════════════════════════════════════

    @Test @Order(2)
    void bookingValidation_HasEnoughSeats_ReturnsTrue() {
        when(seatRepository.countAvailableSeatsByFlightId(1L)).thenReturn(5);
        assertTrue(bookingValidationService.hasEnoughAvailableSeats(1L, 3));
        verify(seatRepository).countAvailableSeatsByFlightId(1L);
    }

    @Test @Order(3)
    void bookingValidation_HasEnoughSeats_ReturnsFalse() {
        when(seatRepository.countAvailableSeatsByFlightId(1L)).thenReturn(4);
        assertFalse(bookingValidationService.hasEnoughAvailableSeats(1L, 6));
        verify(seatRepository).countAvailableSeatsByFlightId(1L);
    }

    @Test @Order(4)
    void bookingValidation_AreSeatsAvailable_ReturnsTrue() {
        List<String> seats = List.of("A1", "A2");
        when(seatRepository.countUnavailableSeats(1L, seats)).thenReturn(0);
        assertTrue(bookingValidationService.areSeatsAvailable(1L, seats));
        verify(seatRepository).countUnavailableSeats(1L, seats);
    }

    @Test @Order(5)
    void bookingValidation_AreSeatsAvailable_ReturnsFalse() {
        List<String> seats = List.of("A1", "A2");
        when(seatRepository.countUnavailableSeats(1L, seats)).thenReturn(1);
        assertFalse(bookingValidationService.areSeatsAvailable(1L, seats));
        verify(seatRepository).countUnavailableSeats(1L, seats);
    }


    // ═══════════════════════════════════════════════════════════════════
    // SECTION 3 — BookingService Unit Tests  (9 tests)
    // ═══════════════════════════════════════════════════════════════════

    @Test @Order(6)
    void bookingService_BookFlight_ReturnsConfirmedBooking() {
        User user = new User(); user.setId(1L);

        Bookings booking = new Bookings();
        booking.setUser(user);
        booking.setFlight(mockFlight);
        booking.setSeatNumbers("A1");
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus("CONFIRMED");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(flightsRepository.findById(1L)).thenReturn(Optional.of(mockFlight));
        when(bookingRepository.save(any(Bookings.class))).thenReturn(booking);

        Bookings result = bookingService.bookFlight(1L, 1L, "A1");
        assertNotNull(result);
        assertEquals("CONFIRMED", result.getStatus());
        verify(flightsRepository).save(mockFlight);
    }

    @Test @Order(7)
    void bookingService_GetBookingsByUser_ReturnsList() {
        Bookings b1 = new Bookings(); b1.setStatus("CONFIRMED");
        Bookings b2 = new Bookings(); b2.setStatus("CANCELLED");
        when(bookingRepository.findByUserId(1L)).thenReturn(List.of(b1, b2));

        List<Bookings> result = bookingService.getBookingsByUser(1L);
        assertEquals(2, result.size());
        verify(bookingRepository).findByUserId(1L);
    }

    @Test @Order(8)
    void bookingService_CancelBooking_DeletesRecord() {
        doNothing().when(bookingRepository).deleteById(1L);
        bookingService.cancelBooking(1L);
        verify(bookingRepository).deleteById(1L);
    }

    @Test @Order(9)
    void bookingService_GenerateTicketPdf_ReturnsPdfBytes() {
        Bookings booking = new Bookings();
        booking.setId(1L);
        booking.setFlight(mockFlight);
        booking.setPnr("PNR123456");
        booking.setSeatNumbers("A1");
        booking.setPaymentStatus(Bookings.PaymentStatus.SUCCESS);
        booking.setStatus("CONFIRMED");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        byte[] pdfBytes = bookingService.generateTicketPdf(1L);
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test @Order(10)
    void bookingService_UpdateBookingStatus_ChangesStatus() {
        Bookings booking = new Bookings(); booking.setStatus("CONFIRMED");
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        bookingService.updateBookingStatus(1L, "CANCELLED");
        assertEquals("CANCELLED", booking.getStatus());
        verify(bookingRepository).save(booking);
    }

    @Test @Order(11)
    void bookingService_UpdateBookingStatus_NotFound_ThrowsException() {
        when(bookingRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () ->
            bookingService.updateBookingStatus(99L, "CANCELLED"));
    }

    @Test @Order(12)
    void bookingService_GetBookingListUser_ReturnsAll() {
        Bookings b1 = new Bookings(); b1.setStatus("CONFIRMED");
        when(bookingRepository.findAll()).thenReturn(List.of(b1));

        List<Bookings> result = bookingService.getBookingListUser();
        assertEquals(1, result.size());
    }

    @Test @Order(13)
    void bookingService_BookSeats_Success_SetsPnrAndPaymentStatus() {
        User user = new User(); user.setId(1L);
        mockSeat1.setAvailable(true);

        when(seatRepository.findByFlightIdAndSeatNumberIn(1L, List.of("A1")))
            .thenReturn(List.of(mockSeat1));
        when(flightsRepository.findById(1L)).thenReturn(Optional.of(mockFlight));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookingRepository.save(any(Bookings.class))).thenAnswer(inv -> inv.getArgument(0));

        bookingService.bookSeats(1L, List.of("A1"), 1L);

        assertFalse(mockSeat1.isAvailable());
        verify(seatRepository).saveAll(List.of(mockSeat1));

        ArgumentCaptor<Bookings> captor = ArgumentCaptor.forClass(Bookings.class);
        verify(bookingRepository).save(captor.capture());
        Bookings saved = captor.getValue();
        assertNotNull(saved.getPnr());
        assertEquals(Bookings.PaymentStatus.SUCCESS, saved.getPaymentStatus());
        assertEquals("CONFIRMED", saved.getStatus());
    }

    @Test @Order(14)
    void bookingService_BookSeats_AlreadyBooked_ThrowsException() {
        mockSeat1.setAvailable(false);
        when(seatRepository.findByFlightIdAndSeatNumberIn(1L, List.of("A1")))
            .thenReturn(List.of(mockSeat1));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            bookingService.bookSeats(1L, List.of("A1"), 1L));
        assertEquals("One or more selected seats are already booked.", ex.getMessage());
    }


    // ═══════════════════════════════════════════════════════════════════
    // SECTION 4 — FlightsService Unit Tests  (10 tests)
    // ═══════════════════════════════════════════════════════════════════

    @Test @Order(15)
    void flightsService_SearchFlights_ReturnsMatchingFlights() {
        when(flightsRepository.findBySourceAndDestinationAndDepartureDate(
            "Delhi", "Mumbai", mockFlight.getDepartureDate()))
            .thenReturn(List.of(mockFlight));

        List<Flights> result = flightsService.searchFlights("Delhi", "Mumbai", mockFlight.getDepartureDate());
        assertEquals(1, result.size());
        verify(flightsRepository).findBySourceAndDestinationAndDepartureDate(
            "Delhi", "Mumbai", mockFlight.getDepartureDate());
    }

    @Test @Order(16)
    void flightsService_GetAllFlights_ReturnsList() {
        when(flightsRepository.findAll()).thenReturn(List.of(mockFlight));

        List<Flights> result = flightsService.getAllFlights();
        assertEquals(1, result.size());
        verify(flightsRepository).findAll();
    }

    @Test @Order(17)
    void flightsService_GetFlightById_ReturnsCorrectFlight() {
        when(flightsRepository.findById(1L)).thenReturn(Optional.of(mockFlight));

        Flights result = flightsService.getFlightById(1L);
        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test @Order(18)
    void flightsService_SaveFlight_ReturnsSavedFlight() {
        when(flightsRepository.save(mockFlight)).thenReturn(mockFlight);

        Flights result = flightsService.saveFlight(mockFlight);
        assertNotNull(result);
        assertEquals("Delhi", result.getSource());
        verify(flightsRepository).save(mockFlight);
    }

    @Test @Order(19)
    void flightsService_DeleteFlight_InvokesRepository() {
        doNothing().when(flightsRepository).deleteById(1L);
        flightsService.deleteFlight(1L);
        verify(flightsRepository).deleteById(1L);
    }

    @Test @Order(20)
    void flightsService_UpdateFlightStatus_ChangesStatus() {
        when(flightsRepository.findById(1L)).thenReturn(Optional.of(mockFlight));
        when(flightsRepository.save(any(Flights.class))).thenReturn(mockFlight);

        flightsService.updateFlightStatus(1L, "CANCELLED");
        assertEquals("CANCELLED", mockFlight.getStatus());
        verify(flightsRepository).save(mockFlight);
    }

    @Test @Order(21)
    void flightsService_GetSuggestionsForSource_ReturnsList() {
        when(flightsRepository.findAll()).thenReturn(List.of(mockFlight));
        assertEquals(1, flightsService.getSuggestionsForSource().size());
    }

    @Test @Order(22)
    void flightsService_GetSuggestionsForDestination_ReturnsList() {
        when(flightsRepository.findAll()).thenReturn(List.of(mockFlight));
        assertEquals(1, flightsService.getSuggestionsForDestionation().size());
    }

    @Test @Order(23)
    void flightsService_IsSeatsAvailable_ReturnsTrue() {
        when(flightsRepository.findById(1L)).thenReturn(Optional.of(mockFlight));
        assertTrue(flightsService.isSeatsAvailable(1L, 3));
    }

    @Test @Order(24)
    void flightsService_IsSeatsAvailable_ReturnsFalse() {
        when(flightsRepository.findById(1L)).thenReturn(Optional.of(mockFlight));
        assertFalse(flightsService.isSeatsAvailable(1L, 10));
    }


    // ═══════════════════════════════════════════════════════════════════
    // SECTION 5 — FlightScheduleService Unit Tests  (8 tests)
    // ═══════════════════════════════════════════════════════════════════

    @Test @Order(25)
    void scheduleService_GetAllSchedules_ReturnsList() {
        when(flightScheduleRepositoryMock.findAll())
            .thenReturn(List.of(new FlightSchedule(), new FlightSchedule()));

        List<FlightSchedule> result = flightScheduleService.getAllSchedules();
        assertEquals(2, result.size());
        verify(flightScheduleRepositoryMock).findAll();
    }

    @Test @Order(26)
    void scheduleService_UpdateStatus_SetsStatusAndAssignStatus() {
        FlightSchedule schedule = new FlightSchedule();
        schedule.setId(1L);
        schedule.setStatus("PENDING");

        when(flightScheduleRepositoryMock.findById(1L)).thenReturn(Optional.of(schedule));
        when(flightScheduleRepositoryMock.save(any(FlightSchedule.class))).thenReturn(schedule);

        FlightSchedule updated = flightScheduleService.updateStatus(1L, "COMPLETED");
        assertEquals("COMPLETED", updated.getStatus());
        assertEquals("COMPLETED", updated.getAssignStatus());
        verify(flightScheduleRepositoryMock).save(schedule);
    }

    @Test @Order(27)
    void scheduleService_UpdateStatus_NotFound_ThrowsEntityNotFoundException() {
        when(flightScheduleRepositoryMock.findById(99L)).thenReturn(Optional.empty());
        assertThrows(javax.persistence.EntityNotFoundException.class, () ->
            flightScheduleService.updateStatus(99L, "COMPLETED"));
    }

    @Test @Order(28)
    void scheduleService_AssignPilot_Success_ReturnsSchedule() {
        LocalDate date = LocalDate.of(2025, 8, 20);

        when(flightsRepository.findById(1L)).thenReturn(Optional.of(mockFlight));
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockPilot));
        when(flightScheduleRepositoryMock.findByFlightIdAndScheduledDate(1L, date))
            .thenReturn(Optional.empty());

        FlightSchedule saved = new FlightSchedule();
        saved.setFlight(mockFlight);
        saved.setPilot(mockPilot);
        saved.setScheduledDate(date);
        saved.setAssignStatus("ASSIGNED");
        saved.setStatus("ASSIGNED");
        when(flightScheduleRepositoryMock.save(any(FlightSchedule.class))).thenReturn(saved);

        FlightSchedule result = flightScheduleService.assignPilot(1L, 1L, "ASSIGNED", date);
        assertNotNull(result);
        assertEquals("ASSIGNED", result.getAssignStatus());
        assertEquals("ASSIGNED", result.getStatus());
        assertEquals(date, result.getScheduledDate());
        verify(flightScheduleRepositoryMock).save(any(FlightSchedule.class));
    }

    @Test @Order(29)
    void scheduleService_AssignPilot_AlreadyAssigned_ThrowsIllegalState() {
        LocalDate date = LocalDate.of(2025, 8, 20);
        when(flightsRepository.findById(1L)).thenReturn(Optional.of(mockFlight));
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockPilot));
        when(flightScheduleRepositoryMock.findByFlightIdAndScheduledDate(1L, date))
            .thenReturn(Optional.of(new FlightSchedule()));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
            flightScheduleService.assignPilot(1L, 1L, "ASSIGNED", date));
        assertEquals("Pilot already assigned to this flight on the selected date.", ex.getMessage());
    }

    @Test @Order(30)
    void scheduleService_AssignPilot_FlightNotFound_ThrowsEntityNotFoundException() {
        when(flightsRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(javax.persistence.EntityNotFoundException.class, () ->
            flightScheduleService.assignPilot(99L, 1L, "ASSIGNED", LocalDate.now()));
    }

    @Test @Order(31)
    void scheduleService_GetAssignmentsForPilot_ReturnsList() {
        when(flightScheduleRepositoryMock.findByPilotId(1L))
            .thenReturn(List.of(new FlightSchedule()));

        List<FlightSchedule> result = flightScheduleService.getAssignmentsForPilot(1L);
        assertEquals(1, result.size());
        verify(flightScheduleRepositoryMock).findByPilotId(1L);
    }

    @Test @Order(32)
    void scheduleService_FindByPilot_ReturnsList() {
        when(flightScheduleRepositoryMock.findByPilot(mockPilot))
            .thenReturn(List.of(new FlightSchedule()));

        List<FlightSchedule> result = flightScheduleService.findByPilot(mockPilot);
        assertEquals(1, result.size());
        verify(flightScheduleRepositoryMock).findByPilot(mockPilot);
    }


    // ═══════════════════════════════════════════════════════════════════
    // SECTION 6 — Controller Integration Tests  (28 tests)
    // ═══════════════════════════════════════════════════════════════════

    // ── Auth Controller (10 tests) ────────────────────────────────────

    @Test @Order(33)
    void register_ValidUser_Returns201() throws Exception {
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        Map<String, Object> body = new HashMap<>();
        body.put("username", "newuser_" + uniqueSuffix);
        body.put("password", "Pass@123");
        body.put("email", "newuser_" + uniqueSuffix + "@test.com");
        body.put("role", "PASSENGER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newuser_" + uniqueSuffix))
                .andExpect(jsonPath("$.role").value("PASSENGER"));
    }

    @Test @Order(34)
    void register_MissingUsername_Returns400() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("password", "Pass@123");
        body.put("email", "noname@test.com");
        body.put("role", "PASSENGER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details.username").value("Username is required"));
    }

    @Test @Order(35)
    void register_InvalidEmail_Returns400() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("username", "bademail_user");
        body.put("password", "Pass@123");
        body.put("email", "not-a-valid-email");
        body.put("role", "PASSENGER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.email").value("Email must be valid"));
    }

    @Test @Order(36)
    void register_MissingRole_Returns400() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("username", "norole_user");
        body.put("password", "Pass@123");
        body.put("email", "norole@test.com");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.role").value("Role is required"));
    }

    @Test @Order(37)
    void login_ValidAdmin_ReturnsTokenAndRole() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("username", "admin_test");
        body.put("password", "Admin@123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andReturn();

        adminToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();
    }

    @Test @Order(38)
    void login_ValidPassenger_ReturnsToken() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("username", "passenger_test");
        body.put("password", "Pass@123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PASSENGER"))
                .andReturn();

        passengerToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();
    }

    @Test @Order(39)
    void login_ValidPilot_ReturnsToken() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("username", "pilot_test");
        body.put("password", "Pilot@123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PILOT"))
                .andReturn();

        pilotToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();
    }

    @Test @Order(40)
    void login_WrongPassword_Returns401() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("username", "admin_test");
        body.put("password", "WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test @Order(41)
    void getLoggedInUser_ValidToken_ReturnsUser() throws Exception {
        mockMvc.perform(get("/api/auth/user")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin_test"));
    }

    @Test @Order(42)
    void getLoggedInUser_NoToken_Returns403() throws Exception {
        mockMvc.perform(get("/api/auth/user"))
                .andExpect(status().isForbidden());
    }

    // ── Flight Controller (8 tests) ──────────────────────────────────

    @Test @Order(43)
    void createFlight_ValidData_AsAdmin_Returns201() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("flight_number", "AI101");
        body.put("flight_name", "Air India Express");
        body.put("source", "Delhi");
        body.put("destination", "Mumbai");
        body.put("departureDate", LocalDate.now().plusDays(5).toString());
        body.put("departureTime", "10:00:00");
        body.put("arrivalTime", "12:30:00");
        body.put("totalSeats", 150);
        body.put("available_seats", 150);
        body.put("price", 5000.0);
        body.put("status", "SCHEDULED");

        MvcResult result = mockMvc.perform(post("/api/flights")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.flight_number").value("AI101"))
                .andReturn();

        flightId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("id").asLong();
    }

    @Test @Order(44)
    void createFlight_MissingFlightNumber_Returns400() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("flight_name", "IndiGo");
        body.put("source", "Delhi"); body.put("destination", "Mumbai");
        body.put("departureDate", LocalDate.now().plusDays(5).toString());
        body.put("departureTime", "10:00:00"); body.put("arrivalTime", "12:30:00");
        body.put("totalSeats", 150); body.put("available_seats", 150); body.put("price", 5000.0);

        mockMvc.perform(post("/api/flights")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.flight_number").value("Flight number is required"));
    }

    @Test @Order(45)
    void createFlight_InvalidPrice_Returns400() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("flight_number", "AI202"); body.put("flight_name", "IndiGo");
        body.put("source", "Chennai"); body.put("destination", "Bangalore");
        body.put("departureDate", LocalDate.now().plusDays(3).toString());
        body.put("departureTime", "08:00:00"); body.put("arrivalTime", "09:30:00");
        body.put("totalSeats", 100); body.put("available_seats", 100);
        body.put("price", 0.0);

        mockMvc.perform(post("/api/flights")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.price").value("Price must be greater than 0"));
    }

    @Test @Order(46)
    void createFlight_AsPassenger_Returns403() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("flight_number", "AI303"); body.put("flight_name", "SpiceJet");
        body.put("source", "Kolkata"); body.put("destination", "Hyderabad");
        body.put("departureDate", LocalDate.now().plusDays(7).toString());
        body.put("departureTime", "14:00:00"); body.put("arrivalTime", "16:00:00");
        body.put("totalSeats", 80); body.put("available_seats", 80); body.put("price", 3000.0);

        mockMvc.perform(post("/api/flights")
                .header("Authorization", "Bearer " + passengerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test @Order(47)
    void getAllFlights_AsAdmin_ReturnsFlightList() throws Exception {
        mockMvc.perform(get("/api/flights")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test @Order(48)
    void getAllFlights_NoToken_Returns403() throws Exception {
        mockMvc.perform(get("/api/flights"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(49)
    void searchFlights_ValidParams_ReturnsResults() throws Exception {
        mockMvc.perform(get("/api/flights/search")
                .header("Authorization", "Bearer " + passengerToken)
                .param("source", "Delhi")
                .param("destination", "Mumbai")
                .param("date", LocalDate.now().plusDays(5).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test @Order(50)
    void checkFlightAvailability_ReturnsAvailabilityFlag() throws Exception {
        mockMvc.perform(get("/api/flights/" + flightId + "/check-availability")
                .header("Authorization", "Bearer " + passengerToken)
                .param("travelerCount", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").isBoolean());
    }

    // ── Booking Controller (5 tests) ──────────────────────────────────

    @Test @Order(51)
    void bookSeats_AsPassenger_ReturnsSuccess() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("flightId", flightId);
        body.put("seatNumbers", new String[]{"A1", "A2"});
        body.put("userId", passengerId);

        mockMvc.perform(post("/api/booking/book-seats")
                .header("Authorization", "Bearer " + passengerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(content().string("Booking Successful"));
    }

    @Test @Order(52)
    void getMyBookings_AsPassenger_ReturnsBookingList() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/booking/bookings")
                .header("Authorization", "Bearer " + passengerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andReturn();

        bookingId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get(0).get("id").asLong();
    }

    @Test @Order(53)
    void getAllBookings_AsAdmin_ReturnsAllBookings() throws Exception {
        mockMvc.perform(get("/api/booking/bookingList")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test @Order(54)
    void updateBookingStatus_AsPassenger_Returns200() throws Exception {
        mockMvc.perform(put("/api/booking/" + bookingId + "/status")
                .header("Authorization", "Bearer " + passengerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"CANCELLED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Booking status updated to CANCELLED"));
    }

    @Test @Order(55)
    void cancelBooking_AsPassenger_Returns200() throws Exception {
        mockMvc.perform(delete("/api/booking/bookings/" + bookingId)
                .header("Authorization", "Bearer " + passengerToken))
                .andExpect(status().isOk());
    }

    // ── Flight Schedule Controller (3 tests) ──────────────────────────

    @Test @Order(56)
    void assignPilot_AsAdmin_Returns200() throws Exception {
        String date = LocalDate.now().plusDays(5).toString();

        MvcResult result = mockMvc.perform(post("/api/pilot/schedule/admin/assign-pilot")
                .header("Authorization", "Bearer " + adminToken)
                .param("flightId", flightId.toString())
                .param("pilotId", pilotId.toString())
                .param("scheduledDate", date)
                .param("assignStatus", "ASSIGNED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignStatus").value("ASSIGNED"))
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andReturn();

        scheduleId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("id").asLong();
    }

    @Test @Order(57)
    void assignPilot_SameDateConflict_Returns409() throws Exception {
        mockMvc.perform(post("/api/pilot/schedule/admin/assign-pilot")
                .header("Authorization", "Bearer " + adminToken)
                .param("flightId", flightId.toString())
                .param("pilotId", pilotId.toString())
                .param("scheduledDate", LocalDate.now().plusDays(5).toString())
                .param("assignStatus", "ASSIGNED"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message")
                        .value("Pilot already assigned to this flight on the selected date."));
    }

    @Test @Order(58)
    void updateScheduleStatus_AsPilot_Returns200() throws Exception {
        mockMvc.perform(put("/api/pilot/schedule/" + scheduleId + "/status")
                .header("Authorization", "Bearer " + pilotToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"ACCEPTED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    // ── Global Exception Handler (2 tests) ────────────────────────────

    @Test @Order(59)
    void globalHandler_Returns400_WithFullErrorStructure() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("password", "Pass@123");
        body.put("email", "valid@test.com");
        body.put("role", "PASSENGER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details").isMap());
    }

    @Test @Order(60)
    void globalHandler_EmptyBody_ReturnsAllValidationErrors() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details", aMapWithSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$.details.username").exists())
                .andExpect(jsonPath("$.details.password").exists())
                .andExpect(jsonPath("$.details.email").exists())
                .andExpect(jsonPath("$.details.role").exists());
    }
}
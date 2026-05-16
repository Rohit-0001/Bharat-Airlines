package com.edutech.util;

/**
 * Flight schedule workflow statuses (stored as strings in DB for backward compatibility).
 */
public final class ScheduleStatusConstants {

    private ScheduleStatusConstants() {}

    public static final String PENDING_PILOT_ASSIGNMENT = "PENDING_PILOT_ASSIGNMENT";
    public static final String AWAITING_PILOT_ACCEPTANCE = "AWAITING_PILOT_ACCEPTANCE";
    public static final String PILOT_REJECTED = "PILOT_REJECTED";
    public static final String CONFIRMED = "CONFIRMED";
    public static final String BOARDING = "BOARDING";
    public static final String COMPLETED = "COMPLETED";
    public static final String CANCELLED = "CANCELLED";

    /** Pilot accepted the assignment */
    public static final String PILOT_ACCEPTED = "ACCEPTED";
    /** Pilot rejected the assignment */
    public static final String PILOT_REJECTED_ASSIGN = "REJECTED";

    public static boolean isPassengerBookable(String status, String assignStatus) {
        return CONFIRMED.equalsIgnoreCase(status)
                && PILOT_ACCEPTED.equalsIgnoreCase(assignStatus);
    }
}

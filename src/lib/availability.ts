
import { Schedule } from "./data";
import { format } from "date-fns";

export type AvailabilityStatus = "AVAILABLE" | "CLOSED" | "DAY_OFF" | "BLOCKED" | "HOLIDAY";

export function getTherapistAvailability(schedule: Schedule, date: Date = new Date()): AvailabilityStatus {
    // 1. Holiday Check
    if (schedule.onHoliday) {
        return "HOLIDAY";
    }

    // 2. Blocked Date Check
    const dateString = format(date, "yyyy-MM-dd");
    if (schedule.blockedDates.includes(dateString)) {
        return "BLOCKED";
    }

    // 3. Working Day Check
    const dayName = format(date, "EEE"); // "Mon", "Tue", etc.
    if (!schedule.workingDays.includes(dayName)) {
        return "DAY_OFF";
    }

    // 4. Working Hours Check
    const currentHour = format(date, "HH:mm");
    if (currentHour < schedule.workingHours.start || currentHour > schedule.workingHours.end) {
        return "CLOSED";
    }

    return "AVAILABLE";
}

export function getAvailabilityLabel(status: AvailabilityStatus): { label: string; color: string } {
    switch (status) {
        case "AVAILABLE":
            return { label: "Available Now", color: "bg-green-100 text-green-700 border-green-200" };
        case "CLOSED":
            return { label: "Closed Now", color: "bg-gray-100 text-gray-500 border-gray-200" };
        case "DAY_OFF":
            return { label: "Day Off", color: "bg-gray-100 text-gray-500 border-gray-200" };
        case "BLOCKED":
            return { label: "Unix", color: "bg-red-50 text-red-500 border-red-100" }; // "Unavailable" is better UI text
        case "HOLIDAY":
            return { label: "On Holiday", color: "bg-amber-50 text-amber-600 border-amber-100" };
        default:
            return { label: "", color: "" };
    }
}

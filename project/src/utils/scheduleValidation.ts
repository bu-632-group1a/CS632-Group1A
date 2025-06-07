import { Session } from '../types';

interface TimeSlot {
  start: Date;
  end: Date;
}

export class ScheduleValidator {
  private static parseTime(timeString: string, date: string): Date {
    // Handle time formats like "9:00 AM - 10:00 AM" or "9:00 AM"
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) {
      throw new Error(`Invalid time format: ${timeString}`);
    }

    const [, hours, minutes, period] = timeMatch;
    let hour24 = parseInt(hours, 10);
    
    if (period.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const sessionDate = new Date(date);
    sessionDate.setHours(hour24, parseInt(minutes, 10), 0, 0);
    return sessionDate;
  }

  private static getSessionTimeSlot(session: Session): TimeSlot {
    const timeRange = session.time.split(' - ');
    const startTime = timeRange[0].trim();
    const endTime = timeRange[1]?.trim() || startTime;

    const start = this.parseTime(startTime, session.date);
    let end: Date;

    if (timeRange.length > 1) {
      end = this.parseTime(endTime, session.date);
    } else {
      // If no end time specified, assume 1 hour duration
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }

    return { start, end };
  }

  private static doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    return slot1.start < slot2.end && slot2.start < slot1.end;
  }

  static validateScheduleConflict(
    newSession: Session,
    existingBookmarkedSessions: Session[]
  ): { hasConflict: boolean; conflictingSessions: Session[] } {
    try {
      const newSessionSlot = this.getSessionTimeSlot(newSession);
      const conflictingSessions: Session[] = [];

      for (const existingSession of existingBookmarkedSessions) {
        // Skip if different dates
        if (existingSession.date !== newSession.date) {
          continue;
        }

        // Skip if same session
        if (existingSession.id === newSession.id) {
          continue;
        }

        try {
          const existingSessionSlot = this.getSessionTimeSlot(existingSession);
          
          if (this.doTimeSlotsOverlap(newSessionSlot, existingSessionSlot)) {
            conflictingSessions.push(existingSession);
          }
        } catch (error) {
          console.warn(`Failed to parse time for session ${existingSession.id}:`, error);
          // Continue with other sessions if one fails to parse
        }
      }

      return {
        hasConflict: conflictingSessions.length > 0,
        conflictingSessions,
      };
    } catch (error) {
      console.error('Error validating schedule conflict:', error);
      // Return no conflict if validation fails to prevent blocking user
      return { hasConflict: false, conflictingSessions: [] };
    }
  }

  static formatConflictMessage(conflictingSessions: Session[]): string {
    if (conflictingSessions.length === 0) return '';
    
    if (conflictingSessions.length === 1) {
      const session = conflictingSessions[0];
      return `This session conflicts with "${session.title}" (${session.time})`;
    }
    
    return `This session conflicts with ${conflictingSessions.length} other bookmarked sessions`;
  }
}
import { ScheduleValidator } from '../../utils/scheduleValidation';
import { Session } from '../../types';

const createMockSession = (
  id: string,
  time: string,
  date: string = '2025-06-13',
  title: string = 'Test Session'
): Session => ({
  id,
  title,
  description: 'Test description',
  speaker: 'Test Speaker',
  time,
  location: 'Test Location',
  category: 'Test',
  date,
  type: 'presentation'
});

describe('ScheduleValidator', () => {
  describe('validateScheduleConflict', () => {
    it('should detect no conflict for non-overlapping sessions', () => {
      const newSession = createMockSession('1', '9:00 AM - 10:00 AM');
      const existingSessions = [
        createMockSession('2', '10:00 AM - 11:00 AM'),
        createMockSession('3', '11:00 AM - 12:00 PM'),
      ];

      const result = ScheduleValidator.validateScheduleConflict(newSession, existingSessions);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictingSessions).toHaveLength(0);
    });

    it('should detect conflict for overlapping sessions', () => {
      const newSession = createMockSession('1', '9:00 AM - 10:30 AM');
      const existingSessions = [
        createMockSession('2', '10:00 AM - 11:00 AM'),
        createMockSession('3', '11:00 AM - 12:00 PM'),
      ];

      const result = ScheduleValidator.validateScheduleConflict(newSession, existingSessions);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictingSessions).toHaveLength(1);
      expect(result.conflictingSessions[0].id).toBe('2');
    });

    it('should detect multiple conflicts', () => {
      const newSession = createMockSession('1', '9:30 AM - 11:30 AM');
      const existingSessions = [
        createMockSession('2', '9:00 AM - 10:00 AM'),
        createMockSession('3', '10:30 AM - 12:00 PM'),
        createMockSession('4', '1:00 PM - 2:00 PM'),
      ];

      const result = ScheduleValidator.validateScheduleConflict(newSession, existingSessions);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictingSessions).toHaveLength(2);
      expect(result.conflictingSessions.map(s => s.id)).toEqual(['2', '3']);
    });

    it('should ignore sessions on different dates', () => {
      const newSession = createMockSession('1', '9:00 AM - 10:00 AM', '2025-06-13');
      const existingSessions = [
        createMockSession('2', '9:00 AM - 10:00 AM', '2025-06-14'),
      ];

      const result = ScheduleValidator.validateScheduleConflict(newSession, existingSessions);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictingSessions).toHaveLength(0);
    });

    it('should ignore the same session', () => {
      const newSession = createMockSession('1', '9:00 AM - 10:00 AM');
      const existingSessions = [
        createMockSession('1', '9:00 AM - 10:00 AM'),
      ];

      const result = ScheduleValidator.validateScheduleConflict(newSession, existingSessions);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictingSessions).toHaveLength(0);
    });

    it('should handle PM times correctly', () => {
      const newSession = createMockSession('1', '1:00 PM - 2:00 PM');
      const existingSessions = [
        createMockSession('2', '1:30 PM - 2:30 PM'),
      ];

      const result = ScheduleValidator.validateScheduleConflict(newSession, existingSessions);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictingSessions).toHaveLength(1);
    });

    it('should handle 12 PM correctly', () => {
      const newSession = createMockSession('1', '12:00 PM - 1:00 PM');
      const existingSessions = [
        createMockSession('2', '12:30 PM - 1:30 PM'),
      ];

      const result = ScheduleValidator.validateScheduleConflict(newSession, existingSessions);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictingSessions).toHaveLength(1);
    });

    it('should handle invalid time formats gracefully', () => {
      const newSession = createMockSession('1', 'Invalid Time');
      const existingSessions = [
        createMockSession('2', '10:00 AM - 11:00 AM'),
      ];

      const result = ScheduleValidator.validateScheduleConflict(newSession, existingSessions);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictingSessions).toHaveLength(0);
    });
  });

  describe('formatConflictMessage', () => {
    it('should return empty string for no conflicts', () => {
      const result = ScheduleValidator.formatConflictMessage([]);
      expect(result).toBe('');
    });

    it('should format single conflict message', () => {
      const conflictingSessions = [
        createMockSession('1', '10:00 AM - 11:00 AM', '2025-06-13', 'Test Session')
      ];

      const result = ScheduleValidator.formatConflictMessage(conflictingSessions);
      expect(result).toBe('This session conflicts with "Test Session" (10:00 AM - 11:00 AM)');
    });

    it('should format multiple conflicts message', () => {
      const conflictingSessions = [
        createMockSession('1', '10:00 AM - 11:00 AM'),
        createMockSession('2', '11:00 AM - 12:00 PM'),
      ];

      const result = ScheduleValidator.formatConflictMessage(conflictingSessions);
      expect(result).toBe('This session conflicts with 2 other bookmarked sessions');
    });
  });
});
import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatRelativeTime,
  isOverdue,
  getDaysUntilDue,
  getWeekRange,
  isToday,
  isTomorrow,
  isThisWeek
} from '../dateUtils';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('Jan 15, 2024');
    });

    it('handles different formats', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date, 'short')).toBe('1/15/24');
      expect(formatDate(date, 'long')).toBe('January 15, 2024');
    });

    it('handles invalid dates', () => {
      expect(formatDate(null)).toBe('Invalid Date');
      expect(formatDate(undefined)).toBe('Invalid Date');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative time correctly', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
      expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
    });

    it('handles future dates', () => {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      expect(formatRelativeTime(oneHourFromNow)).toBe('in 1 hour');
    });

    it('handles just now', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);

      expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now');
    });
  });

  describe('isOverdue', () => {
    it('returns true for overdue dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(isOverdue(yesterday)).toBe(true);
    });

    it('returns false for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(isOverdue(tomorrow)).toBe(false);
    });

    it('returns false for today', () => {
      const today = new Date();
      expect(isOverdue(today)).toBe(false);
    });

    it('handles null dates', () => {
      expect(isOverdue(null)).toBe(false);
    });
  });

  describe('getDaysUntilDue', () => {
    it('calculates days until due correctly', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(getDaysUntilDue(tomorrow)).toBe(1);
    });

    it('returns negative for overdue', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(getDaysUntilDue(yesterday)).toBe(-1);
    });

    it('returns 0 for today', () => {
      const today = new Date();
      expect(getDaysUntilDue(today)).toBe(0);
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      const now = new Date();
      expect(isToday(now)).toBe(true);
    });

    it('returns false for other days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('isTomorrow', () => {
    it('returns true for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(isTomorrow(tomorrow)).toBe(true);
    });

    it('returns false for other days', () => {
      const today = new Date();
      expect(isTomorrow(today)).toBe(false);
    });
  });

  describe('isThisWeek', () => {
    it('returns true for dates in current week', () => {
      const today = new Date();
      expect(isThisWeek(today)).toBe(true);
    });

    it('returns false for dates outside current week', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 8);

      expect(isThisWeek(nextWeek)).toBe(false);
    });
  });

  describe('getWeekRange', () => {
    it('returns correct week range', () => {
      const date = new Date('2024-01-15'); // Monday
      const range = getWeekRange(date);

      expect(range.start.getDay()).toBe(1); // Monday
      expect(range.end.getDay()).toBe(0); // Sunday
    });

    it('handles different start of week', () => {
      const date = new Date('2024-01-15');
      const range = getWeekRange(date, 0); // Sunday start

      expect(range.start.getDay()).toBe(0); // Sunday
      expect(range.end.getDay()).toBe(6); // Saturday
    });
  });
});
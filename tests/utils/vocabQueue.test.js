import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextCard } from '../../src/utils/scheduler'; // Adjust path as needed

// Constants from your file for reference in tests
const HOUR = 60 * 60 * 1000;
const NUDGE_BASE = 1.6;
const REVIEW_BASE = 2.2;

describe('nextCard', () => {
  // Freezes "Now" to a specific timestamp (e.g., 2024-01-01 12:00:00)
  const MOCK_NOW = 1700000000000; 

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Correct Answers (Score 1)', () => {
    it('increments streak and adds base time + buffer', () => {
      const initialStreak = 0;
      const reviewTime = MOCK_NOW; // Reviewed just now
      
      const result = nextCard(1, reviewTime, initialStreak, 'activereview', 100);

      expect(result.streak).toBe(1);
      
      // Math: (2.2 ^ 1) + 5 = 7.2 hours
      const expectedTime = MOCK_NOW + (7.2 * HOUR);
      expect(result.next_review).toBe(expectedTime);
    });

    it('uses NUDGE base points when mode is nudge', () => {
      const result = nextCard(1, MOCK_NOW, 1, 'nudge', 100);

      // Streak becomes 2
      // Math: (1.6 ^ 2) + 5 = 2.56 + 5 = 7.56 hours
      const expectedTime = MOCK_NOW + (7.56 * HOUR);
      
      expect(result.streak).toBe(2);
      expect(result.next_review).toBe(expectedTime);
    });

    it('grows exponentially with higher streaks', () => {
      // Streak 4 -> 5
      const result = nextCard(1, MOCK_NOW, 4, 'activereview', 100);
      
      // Math: (2.2 ^ 5) + 5 = ~51.53 + 5 = ~56.53 hours
      const addedHours = (REVIEW_BASE ** 5) + 5;
      
      expect(result.streak).toBe(5);
      expect(result.next_review).toBeCloseTo(MOCK_NOW + (addedHours * HOUR), -2); 
    });
  });

  describe('Wrong Answers (Score 0)', () => {
    it('resets streak to 0', () => {
      const result = nextCard(0, MOCK_NOW, 10, 'activereview', 100);
      expect(result.streak).toBe(0);
    });

    it('calculates penalty based on list size (Small List)', () => {
      const listSize = 10;
      const result = nextCard(0, MOCK_NOW, 5, 'activereview', listSize);

      // Math: 0.03 * 10 = 0.3 hours
      const expectedTime = MOCK_NOW + (0.3 * HOUR);
      expect(result.next_review).toBe(expectedTime);
    });

    it('calculates penalty based on list size (Large List)', () => {
      const listSize = 1000;
      const result = nextCard(0, MOCK_NOW, 5, 'activereview', listSize);

      // Math: 0.03 * 1000 = 30 hours
      const expectedTime = MOCK_NOW + (30 * HOUR);
      expect(result.next_review).toBe(expectedTime);
    });
  });

  describe('Time Anchor Safety Checks', () => {
    it('anchors to NOW if previous review was in the past (The "Lone Old Card" fix)', () => {
      const ancientTime = MOCK_NOW - (100 * HOUR); // 100 hours ago
      
      // Even though review_time was 100 hours ago, we expect the calculation
      // to start from MOCK_NOW so it doesn't get stuck in the past.
      const result = nextCard(1, ancientTime, 0, 'activereview', 100);

      // Math: (2.2 ^ 1) + 5 = 7.2 hours
      // Should be NOW + 7.2, NOT ancientTime + 7.2
      const expectedTime = MOCK_NOW + (7.2 * HOUR);
      
      expect(result.next_review).toBe(expectedTime);
    });

    it('preserves relative order if previous review was in the future', () => {
      // Scenario: Card was already scheduled for tomorrow, user reviews it early? 
      // Or simply verifying the Math.max() logic respects future times.
      const futureTime = MOCK_NOW + (10 * HOUR); 
      
      const result = nextCard(1, futureTime, 0, 'activereview', 100);

      // Math: 7.2 hours added
      // Should add to futureTime, not reset to NOW
      const expectedTime = futureTime + (7.2 * HOUR);
      
      expect(result.next_review).toBe(expectedTime);
    });
  });
});
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextReview, nextCard, resetQueue } from '../../src/utils/vocabQueue';

// Mock supabase
const mockOrder = vi.fn();
const mockEq = vi.fn(() => ({ order: mockOrder }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('../../src/supabaseClient', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

// Constants from your file for reference in tests
const HOUR = 60 * 60 * 1000;
const REVIEW_BASE = 2.2;

describe('nextReview', () => {
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
      
      const result = nextReview(1, reviewTime, initialStreak, 'activereview', 100);

      expect(result.streak).toBe(1);
      
      // Math: (2.2 ^ 1) + 5 = 7.2 hours
      const expectedTime = MOCK_NOW + (7.2 * HOUR);
      expect(result.next_review).toBe(expectedTime);
    });

    it('uses NUDGE base points when mode is nudge', () => {
      const result = nextReview(1, MOCK_NOW, 1, 'nudge', 100);

      // Streak becomes 2
      // Math: (1.6 ^ 2) + 5 = 2.56 + 5 = 7.56 hours
      const expectedTime = MOCK_NOW + (7.56 * HOUR);
      
      expect(result.streak).toBe(2);
      expect(result.next_review).toBe(expectedTime);
    });

    it('grows exponentially with higher streaks', () => {
      // Streak 4 -> 5
      const result = nextReview(1, MOCK_NOW, 4, 'activereview', 100);
      
      // Math: (2.2 ^ 5) + 5 = ~51.53 + 5 = ~56.53 hours
      const addedHours = (REVIEW_BASE ** 5) + 5;
      
      expect(result.streak).toBe(5);
      expect(result.next_review).toBeCloseTo(MOCK_NOW + (addedHours * HOUR), -2); 
    });
  });

  describe('Wrong Answers (Score 0)', () => {
    it('resets streak to 0', () => {
      const result = nextReview(0, MOCK_NOW, 10, 'activereview', 100);
      expect(result.streak).toBe(0);
    });

    it('calculates penalty based on list size (Small List)', () => {
      const listSize = 10;
      const result = nextReview(0, MOCK_NOW, 5, 'activereview', listSize);

      // Math: 0.03 * 10 = 0.3 hours
      const expectedTime = MOCK_NOW + (0.3 * HOUR);
      expect(result.next_review).toBe(expectedTime);
    });

    it('calculates penalty based on list size (Large List)', () => {
      const listSize = 1000;
      const result = nextReview(0, MOCK_NOW, 5, 'activereview', listSize);

      // Math: 0.03 * 1000 = 30 hours
      const expectedTime = MOCK_NOW + (30 * HOUR);
      expect(result.next_review).toBe(expectedTime);
    });
  });

  describe('Time Anchor Safety Checks', () => {
    it('adds interval from the given review_time even if in the past', () => {
      const ancientTime = MOCK_NOW - (100 * HOUR); // 100 hours ago

      const result = nextReview(1, ancientTime, 0, 'activereview', 100);

      // Math: (2.2 ^ 1) + 5 = 7.2 hours added to ancientTime
      const expectedTime = ancientTime + (7.2 * HOUR);

      expect(result.next_review).toBe(expectedTime);
    });

    it('preserves relative order if previous review was in the future', () => {
      // Scenario: Card was already scheduled for tomorrow, user reviews it early? 
      // Or simply verifying the Math.max() logic respects future times.
      const futureTime = MOCK_NOW + (10 * HOUR); 
      
      const result = nextReview(1, futureTime, 0, 'activereview', 100);

      // Math: 7.2 hours added
      // Should add to futureTime, not reset to NOW
      const expectedTime = futureTime + (7.2 * HOUR);
      
      expect(result.next_review).toBe(expectedTime);
    });
  });
});

const MOCK_CARDS = [
  { id: 'a', front: 'hello', back: 'ciao', next_review: 1000 },
  { id: 'b', front: 'goodbye', back: 'arrivederci', next_review: 2000 },
  { id: 'c', front: 'thanks', back: 'grazie', next_review: 3000 },
];

describe('nextCard', () => {
  beforeEach(() => {
    resetQueue('deck-1');
    mockOrder.mockReset();
    mockFrom.mockClear();
  });

  it('returns the first card and listSize on first call', async () => {
    mockOrder.mockResolvedValue({ data: MOCK_CARDS, error: null });

    const result = await nextCard({ deckId: 'deck-1' });

    expect(result.card).toEqual(MOCK_CARDS[0]);
    expect(result.listSize).toBe(3);
  });

  it('skips seen cards on subsequent calls', async () => {
    mockOrder.mockResolvedValue({ data: MOCK_CARDS, error: null });

    await nextCard({ deckId: 'deck-1' }); // sees card 'a'
    const result = await nextCard({ deckId: 'deck-1' }); // should get 'b'

    expect(result.card).toEqual(MOCK_CARDS[1]);
  });

  it('returns null when all cards have been seen', async () => {
    mockOrder.mockResolvedValue({ data: MOCK_CARDS, error: null });

    await nextCard({ deckId: 'deck-1' }); // a
    await nextCard({ deckId: 'deck-1' }); // b
    await nextCard({ deckId: 'deck-1' }); // c
    const result = await nextCard({ deckId: 'deck-1' });

    expect(result).toBeNull();
  });

  it('only fetches from Supabase once (uses cache)', async () => {
    mockOrder.mockResolvedValue({ data: MOCK_CARDS, error: null });

    await nextCard({ deckId: 'deck-1' });
    await nextCard({ deckId: 'deck-1' });
    await nextCard({ deckId: 'deck-1' });

    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it('returns null on Supabase error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'fail' } });

    const result = await nextCard({ deckId: 'deck-1' });

    expect(result).toBeNull();
  });
});

describe('resetQueue', () => {
  beforeEach(() => {
    resetQueue('deck-1');
    mockOrder.mockReset();
    mockFrom.mockClear();
  });

  it('clears cache so next call re-fetches from Supabase', async () => {
    mockOrder.mockResolvedValue({ data: MOCK_CARDS, error: null });

    await nextCard({ deckId: 'deck-1' });
    expect(mockFrom).toHaveBeenCalledTimes(1);

    resetQueue('deck-1');

    await nextCard({ deckId: 'deck-1' });
    expect(mockFrom).toHaveBeenCalledTimes(2);
  });

  it('resets seen cards so deck can be replayed', async () => {
    mockOrder.mockResolvedValue({ data: MOCK_CARDS, error: null });

    await nextCard({ deckId: 'deck-1' }); // a
    await nextCard({ deckId: 'deck-1' }); // b
    await nextCard({ deckId: 'deck-1' }); // c
    expect(await nextCard({ deckId: 'deck-1' })).toBeNull();

    resetQueue('deck-1');

    const result = await nextCard({ deckId: 'deck-1' });
    expect(result.card).toEqual(MOCK_CARDS[0]); // back to first card
  });
});
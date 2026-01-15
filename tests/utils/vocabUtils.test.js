import { describe, it, expect } from 'vitest';
import { sortVocabs, getVocabsCacheKey } from '../../src/utils/vocabUtils';

describe('getVocabsCacheKey', () => {
  it('builds key for numeric id', () => {
    expect(getVocabsCacheKey(123)).toBe('supabase_vocabs_cache_123');
  });

  it('builds key for 0', () => {
    expect(getVocabsCacheKey(0)).toBe('supabase_vocabs_cache_0');
  });

  it('throws for null, undefined, and empty string', () => {
    expect(() => getVocabsCacheKey(null)).toThrow();
    expect(() => getVocabsCacheKey(undefined)).toThrow();
    expect(() => getVocabsCacheKey('')).toThrow();
  });
});

describe('sortVocabs', () => {
  it('returns empty array for null or non-array input', () => {
    expect(sortVocabs(null)).toEqual([]);
    expect(sortVocabs(undefined)).toEqual([]);
  });

  it('sorts by name using locale compare and handles non-ASCII', () => {
    const data = [{ front: 'éclair' }, { front: 'apple' }, { front: 'Banana' }];
    const result = sortVocabs(data, 'name').map(r => r.front);
    // Lowercase/baseline comparison should place 'apple' before 'éclair'
    expect(result[0].toLowerCase()).toBe('apple');
    expect(result).toContain('éclair');
    expect(result).toContain('Banana');
  });

  it('handles duplicate names without losing items', () => {
    const data = [{ front: 'apple' }, { front: 'apple' }, { front: 'banana' }];
    const res = sortVocabs(data, 'name').map(r => r.front);
    expect(res.filter(x => x === 'apple')).toHaveLength(2);
    expect(res[0]).toBe('apple');
  });

  it('sorts by newest and treats missing/invalid dates as oldest (so they appear later)', () => {
    const data = [
      { front: 'A', created_at: '2024-01-02' },
      { front: 'B' },
      { front: 'C', created_at: 'not-a-date' },
    ];

    const sorted = sortVocabs(data, 'newest').map(r => r.front);
    expect(sorted[0]).toBe('A');
    // B and C (missing/invalid) should appear after A
    expect(sorted.slice(1)).toEqual(expect.arrayContaining(['B', 'C']));
  });

  it('sorts by oldest and puts missing/invalid dates at the end', () => {
    const data = [
      { front: 'A', created_at: '2024-01-02' },
      { front: 'B' },
      { front: 'C', created_at: '2023-01-01' },
    ];

    const sorted = sortVocabs(data, 'oldest').map(r => r.front);
    // Oldest should have C (2023), then A (2024), then B (missing)
    expect(sorted[0]).toBe('C');
    expect(sorted[1]).toBe('A');
    expect(sorted[2]).toBe('B');
  });

  it('does not mutate the original array', () => {
    const data = [{ front: 'b', created_at: '2024-01-01' }, { front: 'a', created_at: '2023-01-01' }];
    const copy = JSON.parse(JSON.stringify(data));
    sortVocabs(data, 'name');
    expect(data).toEqual(copy);
  });
});

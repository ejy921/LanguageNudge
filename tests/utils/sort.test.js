import { describe, it, expect } from 'vitest';
import { sortVocabs } from '../../src/utils/vocabUtils';

describe('sortVocabs', () => {
  it('returns empty array when given empty list', () => {
    expect(sortVocabs([], 'name')).toEqual([]);
  });

  it('sorts by name deterministically and handles non-ASCII', () => {
    const data = [{ front: 'éclair' }, { front: 'apple' }, { front: 'Apple' }];
    const sorted = sortVocabs(data, 'name').map(d => d.front);
    expect(sorted[0].toLowerCase()).toBe('apple');
    // ensure both apple and Apple are adjacent
    expect(sorted.filter(x => x.toLowerCase() === 'apple').length).toBe(2);
  });

  it('sorts by newest placing items without dates last', () => {
    const a = { front: 'A', created_at: '2025-01-01' };
    const b = { front: 'B' }; // no created_at
    const c = { front: 'C', created_at: '2024-01-01' };
    const sorted = sortVocabs([b, c, a], 'newest');
    expect(sorted[0].front).toBe('A');
    expect(sorted[sorted.length - 1].front).toBe('B');
  });

  it('sorts by oldest placing items without dates last', () => {
    const a = { front: 'A', created_at: '2022-01-01' };
    const b = { front: 'B' };
    const c = { front: 'C', created_at: '2023-01-01' };
    const sorted = sortVocabs([b, c, a], 'oldest');
    expect(sorted[0].front).toBe('A');
    expect(sorted[sorted.length - 1].front).toBe('B');
  });

  it('handles duplicate front values without throwing', () => {
    const a = { front: 'Same' };
    const b = { front: 'Same' };
    expect(() => sortVocabs([a, b], 'name')).not.toThrow();
  });
});

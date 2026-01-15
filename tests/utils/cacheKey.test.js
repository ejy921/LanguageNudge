import { describe, it, expect } from 'vitest';
import { getVocabsCacheKey } from '../../src/utils/vocabUtils';

describe('getVocabsCacheKey', () => {
  it('returns proper key for numeric id', () => {
    expect(getVocabsCacheKey(123)).toBe('supabase_vocabs_cache_123');
  });

  it('throws for null or undefined id', () => {
    expect(() => getVocabsCacheKey(null)).toThrow();
    expect(() => getVocabsCacheKey(undefined)).toThrow();
  });
});

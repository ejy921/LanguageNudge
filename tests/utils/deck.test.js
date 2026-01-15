import { describe, it, expect } from 'vitest';
import { createDeck } from '../../src/utils/deck';

describe('createDeck', () => {
  it('creates deck with given name and user id', () => {
    const deck = createDeck('Biology', { id: 'user-1' }, () => 'uuid-test');
    expect(deck).toEqual({ id: 'uuid-test', name: 'Biology', user_id: 'user-1' });
  });

  it('trims whitespace from name', () => {
    const deck = createDeck('  Math  ', { id: 'u2' }, () => 'uuid2');
    expect(deck.name).toBe('Math');
  });

  it('throws on empty or whitespace-only name', () => {
    expect(() => createDeck('', { id: 'u' })).toThrow();
    expect(() => createDeck('   ', { id: 'u' })).toThrow();
  });

  it('throws when user is missing or user.id missing', () => {
    expect(() => createDeck('Name', null)).toThrow();
    expect(() => createDeck('Name', {})).toThrow();
  });
});

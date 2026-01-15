export function createDeck(name, user, uuidFn = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`)) {
  if (!name || String(name).trim() === '') throw new Error('Deck name is required');
  if (!user || !user.id) throw new Error('User is required');
  return { id: uuidFn(), name: String(name).trim(), user_id: user.id };
}

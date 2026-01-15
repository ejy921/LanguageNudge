export function getVocabsCacheKey(deckId) {
  if (!deckId && deckId !== 0) throw new Error('Invalid deckId');
  return `supabase_vocabs_cache_${deckId}`;
}

function parseDateForSort(dateStr, missingAs) {
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return missingAs;
  return t;
}

export function sortVocabs(vocabs = [], sortBy = 'oldest') {
  const copy = Array.isArray(vocabs) ? [...vocabs] : [];
  if (sortBy === 'name') {
    return copy.sort((a, b) => (a.front || '').localeCompare(b.front || '', undefined, { sensitivity: 'base' }));
  }

  if (sortBy === 'newest') {
    return copy.sort((a, b) => {
      const ta = parseDateForSort(a.created_at, -Infinity);
      const tb = parseDateForSort(b.created_at, -Infinity);
      return tb - ta; // descending
    });
  }

  // oldest (default): ascending dates; treat missing as Infinity so they go to the end
  return copy.sort((a, b) => {
    const ta = parseDateForSort(a.created_at, Infinity);
    const tb = parseDateForSort(b.created_at, Infinity);
    return ta - tb; // ascending
  });
}

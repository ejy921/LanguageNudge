import { supabase } from '../supabaseClient';

const NUDGE_BASE_POINT = 1.6;
const REVIEW_BASE_POINT = 2.2;

const ZERO_STREAK = 0.03;

const HOUR_UNIT = 60 * 60 * 1000;

// every card has an interval (0=top of heap)
// @param {number} score - 0=wrong, 1=correct
// @param {number} review_time - timestamp of when card was last reviewed
// @param {number} streak - current correct answer streak
// @param {string} mode - 'nudge' or 'activereview'
// @param {number} list_size - number of cards in the deck (used for penalty calculation on wrong answers)
export function nextReview(score, review_time, streak, mode, list_size) {
    let points = mode === 'nudge' ? NUDGE_BASE_POINT : REVIEW_BASE_POINT;
    let added_hours = 0;

    if (score === 1) {
        streak = streak + 1;
        added_hours = (points ** streak) + 5;
    } 
    else if (score === 0) {
        streak = 0;
        added_hours = ZERO_STREAK * list_size;
    }

    const base = review_time || Date.now();
    const next_review = base + (added_hours * HOUR_UNIT);

    return { next_review, streak };
    
}

const seenCards = new Map();   // deckId -> Set of card IDs
const cachedCards = new Map(); // deckId -> array of cards

export function resetQueue(deckId) {
    seenCards.delete(deckId);
    cachedCards.delete(deckId);
}

export async function nextCard({deckId}) {
    if (!seenCards.has(deckId)) {
        seenCards.set(deckId, new Set());
    }
    const seen = seenCards.get(deckId);

    // Only fetch from Supabase if we haven't cached this deck yet
    if (!cachedCards.has(deckId)) {
        const { data, error } = await supabase
            .from('vocab')
            .select('*')
            .eq('deck_id', deckId)
            .order('next_review', { ascending: true, nullsFirst: true });

        if (error) {
            console.error('Error fetching next card:', error);
            return null;
        }
        cachedCards.set(deckId, data);
    }

    const cards = cachedCards.get(deckId);
    const unseen = cards.filter(card => !seen.has(card.id));
    if (unseen.length === 0) return null;

    const card = unseen[0];
    seen.add(card.id);
    return { card, listSize: cards.length };
}
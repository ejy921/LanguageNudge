const NUDGE_BASE_POINT = 1.6;
const REVIEW_BASE_POINT = 2.2;

const ZERO_STREAK = 0.03;

const HOUR_UNIT = 60 * 60 * 1000;

// every card has an interval (0=top of heap)
// @param {number} score - 0=wrong, 1=correct
// @param {number} review_time - timestamp of when card was last reviewed
// @param {number} streak - current correct answer streak
// @param {string} mode - 'nudge' or 'activereview'
export function nextCard(score, review_time, streak, mode, list_size) {
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
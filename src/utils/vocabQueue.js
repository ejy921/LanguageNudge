const NUDGE_BASE_POINT = 1.6;
const REVIEW_BASE_POINT = 2.2;

// every card has an interval (0=top of heap)
// @param {Object} vocab
// @param {number} score - 0=wrong, 1=correct
// @param {number} review_time - timestamp of when card was last reviewed
// @param {number} streak - current correct answer streak
// @param {string} mode - 'nudge' or 'activereview'
export function nextCard(vocab, score, review_time, streak, mode) {
    let points = mode=='nudge' ? NUDGE_BASE_POINT : REVIEW_BASE_POINT;

    if (score === 1) {
        streak += 1;

        points = points ** streak;

    } else if (score === 0) {
        streak = 0;

        points = points ** streak;
    }
}
/* ------------------------------------------------------------------ */
/*  Spaced Repetition (SM-2 variant)                                  */
/* ------------------------------------------------------------------ */

export interface ReviewRecord {
  lastReview: string;
  nextReview: string;
  interval: number; // days until next review
  easeFactor: number; // 1.3 - 3.0, lower = harder
  reviewCount: number;
}

/**
 * Calculate next review time using SM-2 algorithm
 * @param quality - 0-5 (0=complete blackout, 5=perfect response)
 * @param record - previous review record (null if first time)
 */
export function calculateNextReview(quality: number, record: ReviewRecord | null): ReviewRecord {
  // Clamp quality to 0-5 range
  quality = Math.max(0, Math.min(5, Math.round(quality)));
  const now = new Date();

  if (!record) {
    // First review
    const interval = quality >= 3 ? 1 : 0.5; // 1 day if good, 12h if bad
    return {
      lastReview: now.toISOString(),
      nextReview: new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString(),
      interval,
      easeFactor: 2.5,
      reviewCount: 1,
    };
  }

  let { easeFactor, interval, reviewCount } = record;

  if (quality >= 3) {
    // Good response
    if (reviewCount === 1) {
      interval = 1;
    } else if (reviewCount === 2) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  } else {
    // Poor response — reset interval and review count
    interval = 1;
    reviewCount = 1;
  }

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  return {
    lastReview: now.toISOString(),
    nextReview: new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString(),
    interval,
    easeFactor,
    reviewCount: reviewCount + 1,
  };
}

/**
 * Get review priority score (higher = needs review more urgently)
 * @param record - review record
 */
export function getReviewPriority(record: ReviewRecord): number {
  const now = new Date();
  const nextReview = new Date(record.nextReview);
  const daysOverdue = (now.getTime() - nextReview.getTime()) / (24 * 60 * 60 * 1000);

  if (daysOverdue < 0) return 0; // Not due yet

  // Priority increases with overdue days and decreases with ease factor
  return daysOverdue * (3.0 - record.easeFactor);
}

/**
 * Check if a question is due for review
 */
export function isDueForReview(record: ReviewRecord): boolean {
  return new Date() >= new Date(record.nextReview);
}

/**
 * Get human-readable review status as i18n key + params
 */
export function getReviewStatus(record: ReviewRecord): {
  key: string;
  params?: Record<string, number>;
} {
  const now = new Date();
  const nextReview = new Date(record.nextReview);
  const diffMs = nextReview.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return { key: 'review.due' };
  if (diffDays === 1) return { key: 'review.tomorrow' };
  if (diffDays <= 7) return { key: 'review.inDays', params: { days: diffDays } };
  return { key: 'review.inWeeks', params: { weeks: Math.ceil(diffDays / 7) } };
}

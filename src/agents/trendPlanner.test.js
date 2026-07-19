import { describe, it, expect } from 'vitest';
import { generateTrendSummary } from './trendPlanner';

describe('generateTrendSummary', () => {
  const oneDay = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const makeEntry = (mood, daysAgo, hasTimestamp = true) => ({
    mood,
    timestamp: hasTimestamp ? now - daysAgo * oneDay : undefined,
    moodScore: mood === 'Sedih' ? 8 : 5,
    plutchikCategory: mood // simplify for testing
  });

  it('(a) 3 hari negatif berturut tanpa gap -> return 3', () => {
    const entries = [
      makeEntry('Sedih', 0), // Hari 0
      makeEntry('Cemas', 1), // Hari 1
      makeEntry('Marah', 2), // Hari 2
    ];
    const result = generateTrendSummary(entries);
    expect(result.consecutiveNegativeDays).toBe(3);
  });

  it('(b) 3 hari negatif dengan gap 1 hari kosong di tengah -> return 3 (sesuai definisi "b")', () => {
    const entries = [
      makeEntry('Sedih', 0), // Hari 0
      // Hari 1 kosong
      makeEntry('Cemas', 2), // Hari 2
      makeEntry('Marah', 3), // Hari 3
    ];
    const result = generateTrendSummary(entries);
    expect(result.consecutiveNegativeDays).toBe(3);
  });

  it('(c) beberapa entri negatif di hari yang sama -> dihitung sebagai 1 hari', () => {
    const entries = [
      makeEntry('Sedih', 0), 
      makeEntry('Cemas', 0), // Entri kedua di hari yang sama
      makeEntry('Sedih', 1),
    ];
    const result = generateTrendSummary(entries);
    expect(result.consecutiveNegativeDays).toBe(2);
  });

  it('(d) entri tanpa timestamp valid tidak memengaruhi hasil', () => {
    const entries = [
      makeEntry('Sedih', 0),
      makeEntry('Sedih', 1, false), // Tidak valid, akan dieksklusi
      makeEntry('Tenang', 2),
    ];
    const result = generateTrendSummary(entries);
    expect(result.consecutiveNegativeDays).toBe(1); // Entri 'Tenang' memutus, entri tanpa timestamp dibuang
  });

  it('streak terputus oleh hari positif', () => {
    const entries = [
      makeEntry('Sedih', 0),
      makeEntry('Tenang', 1),
      makeEntry('Marah', 2),
    ];
    const result = generateTrendSummary(entries);
    expect(result.consecutiveNegativeDays).toBe(1);
  });
});

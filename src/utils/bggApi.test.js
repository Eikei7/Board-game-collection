import { describe, expect, it } from 'vitest';
import {
  getRankedSearchResults,
  ensureBggApiToken,
  getApiErrorMessage,
  formatSearchFeedback
} from './bggApi';

describe('formatSearchFeedback', () => {
  it('provides clear empty and success states for the current query', () => {
    expect(formatSearchFeedback('', 0)).toBe('');
    expect(formatSearchFeedback('catan', 0)).toContain('No games found for "catan"');
    expect(formatSearchFeedback('catan', 3)).toContain('Showing 3 results for "catan"');
  });
});

describe('ensureBggApiToken', () => {
  it('throws a clear message when the BGG token is missing', () => {
    expect(() => ensureBggApiToken('')).toThrow(/VITE_BGG_API_TOKEN/i);
  });
});

describe('getApiErrorMessage', () => {
  it('returns a user-friendly description for API and network errors', () => {
    expect(getApiErrorMessage({ code: 'ERR_NETWORK' })).toContain('temporarily unavailable');
    expect(getApiErrorMessage({ response: { status: 429 } })).toContain('too many requests');
  });
});

describe('getRankedSearchResults', () => {
  it('prioritizes exact matches before partial matches', () => {
    const query = 'catan';
    const games = [
      { id: '1', name: 'The Settlers of Catan' },
      { id: '2', name: 'Catan' },
      { id: '3', name: 'Catan Junior' },
      { id: '4', name: 'Carcassonne' }
    ];

    const results = getRankedSearchResults(query, games);

    expect(results.map((game) => game.id)).toEqual(['2', '3', '1']);
  });

  it('returns an empty array when no games match the query', () => {
    const query = 'terraforming';
    const games = [
      { id: '1', name: 'Catan' },
      { id: '2', name: 'Ticket to Ride' }
    ];

    expect(getRankedSearchResults(query, games)).toEqual([]);
  });
});

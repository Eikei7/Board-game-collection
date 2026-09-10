import { describe, expect, it } from 'vitest';
import { normalizeImportedGames, mergeImportedCollection } from './useGameCollection';

describe('normalizeImportedGames', () => {
  it('filters out invalid entries and removes duplicate IDs', () => {
    const games = [
      { id: '1', name: ' Catan ' },
      { id: '2', name: 'Ticket to Ride' },
      { id: '1', name: 'Catan duplicate' },
      { id: '', name: 'Invalid' },
      null,
      { name: 'No ID' }
    ];

    expect(normalizeImportedGames(games)).toEqual([
      { id: '1', name: 'Catan' },
      { id: '2', name: 'Ticket to Ride' }
    ]);
  });
});

describe('mergeImportedCollection', () => {
  it('merges imported entries into the existing collection without duplicates and preserves existing dates', () => {
    const existing = [
      { id: '1', name: 'Catan', addedAt: '2025-01-01' },
      { id: '2', name: 'Ticket to Ride', addedAt: '2025-01-15' }
    ];

    const incoming = [
      { id: '2', name: 'Ticket to Ride', addedAt: '2025-02-01' },
      { id: '3', name: 'Azul' }
    ];

    const merged = mergeImportedCollection(existing, incoming);

    expect(merged).toHaveLength(3);
    expect(merged.find((game) => game.id === '2')?.addedAt).toBe('2025-01-15');
    expect(merged.find((game) => game.id === '3')?.name).toBe('Azul');
  });
});

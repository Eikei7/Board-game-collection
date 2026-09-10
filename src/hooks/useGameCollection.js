import { useState, useCallback, useEffect } from 'react';

export const normalizeImportedGames = (games = []) => {
  if (!Array.isArray(games)) {
    return [];
  }

  const seen = new Set();

  return games
    .filter((game) => game && typeof game === 'object')
    .map((game) => ({
      ...game,
      id: String(game.id ?? '').trim(),
      name: String(game.name ?? '').trim()
    }))
    .filter((game) => game.id && game.name && !seen.has(game.id) && seen.add(game.id));
};

export const mergeImportedCollection = (existingGames = [], incomingGames = []) => {
  const normalizedIncoming = normalizeImportedGames(incomingGames);
  const merged = new Map();

  existingGames.forEach((game) => {
    if (!game || !game.id) return;
    merged.set(String(game.id), { ...game, id: String(game.id) });
  });

  normalizedIncoming.forEach((game) => {
    const id = String(game.id);
    const existing = merged.get(id);

    merged.set(id, {
      ...existing,
      ...game,
      id,
      addedAt: existing?.addedAt || game.addedAt || new Date().toISOString().split('T')[0]
    });
  });

  return [...merged.values()];
};

export function useGameCollection(storageKey = 'boardGameCollection') {
  const [collection, setCollection] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      console.error('Failed to load collection from localStorage');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(collection));
  }, [collection, storageKey]);

  const addGame = useCallback((game) => {
    setCollection(prev => {
      if (prev.some(g => g.id === game.id)) return prev;
      
      const gameWithDate = {
        ...game,
        addedAt: new Date().toISOString().split('T')[0]
      };
      
      return [...prev, gameWithDate];
    });
  }, []);

  const removeGame = useCallback((gameId) => {
    setCollection(prev => prev.filter(g => g.id !== gameId));
  }, []);

  const isInCollection = useCallback((gameId) => {
    return collection.some(g => g.id === gameId);
  }, [collection]);

  const importCollection = useCallback((games) => {
    setCollection(prev => mergeImportedCollection(prev, games));
  }, []);

  return { collection, addGame, removeGame, isInCollection, importCollection };
}
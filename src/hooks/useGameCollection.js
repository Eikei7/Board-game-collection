import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing board game collection
 * Handles adding, removing, and importing games with localStorage persistence
 */
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

  // Persist to localStorage whenever collection changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(collection));
  }, [collection, storageKey]);

  const addGame = useCallback((game) => {
    setCollection(prev => 
      prev.some(g => g.id === game.id) ? prev : [...prev, game]
    );
  }, []);

  const removeGame = useCallback((gameId) => {
    setCollection(prev => prev.filter(g => g.id !== gameId));
  }, []);

  const isInCollection = useCallback((gameId) => {
    return collection.some(g => g.id === gameId);
  }, [collection]);

  const importCollection = useCallback((games) => {
    setCollection(games);
  }, []);

  return { collection, addGame, removeGame, isInCollection, importCollection };
}
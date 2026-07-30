'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WatchlistContextType {
  watchlistIds: Set<number> | null; // null if unauthenticated or not loaded
  addMovieId: (id: number) => void;
  removeMovieId: (id: number) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ 
  children, 
  initialWatchlistIds 
}: { 
  children: React.ReactNode, 
  initialWatchlistIds?: number[] 
}) {
  const [watchlistIds, setWatchlistIds] = useState<Set<number> | null>(null);

  // Initialize state once when prop arrives
  useEffect(() => {
    if (initialWatchlistIds !== undefined) {
      setWatchlistIds(new Set(initialWatchlistIds));
    }
  }, [initialWatchlistIds]);

  const addMovieId = (id: number) => {
    setWatchlistIds(prev => {
      if (!prev) return new Set([id]);
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const removeMovieId = (id: number) => {
    setWatchlistIds(prev => {
      if (!prev) return prev;
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  return (
    <WatchlistContext.Provider value={{ watchlistIds, addMovieId, removeMovieId }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}

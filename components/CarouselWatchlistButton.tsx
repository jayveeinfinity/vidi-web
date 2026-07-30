'use client';

import { useState, useEffect } from 'react';
import { addToWatchlist, removeFromWatchlist } from '@/app/actions/watchlist';
import { useWatchlist } from '@/providers/WatchlistProvider';

interface CarouselWatchlistButtonProps {
  movie: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
  };
  initialIsAdded?: boolean; // Keep for fallback/prop compatibility
}

export default function CarouselWatchlistButton({ movie, initialIsAdded }: CarouselWatchlistButtonProps) {
  const { watchlistIds, addMovieId, removeMovieId } = useWatchlist();
  
  // Determine if it's added using the global context first, then fallback to prop
  const isAdded = watchlistIds ? watchlistIds.has(movie.id) : !!initialIsAdded;
  const [isLoading, setIsLoading] = useState(false);

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    setIsLoading(true);

    if (isAdded) {
      const result = await removeFromWatchlist(movie.id);
      if (result.success) {
        removeMovieId(movie.id);
      } else {
        alert(result.error || 'Failed to remove from watchlist');
      }
    } else {
      const result = await addToWatchlist({
        movieId: movie.id,
        title: movie.title || movie.name || 'Unknown Title',
        posterPath: movie.poster_path,
        releaseYear: (movie.release_date || movie.first_air_date)?.split('-')[0] || 'Unknown',
        genre: 'Movie', // Defaulting since we don't fetch full genres for carousel
        voteAverage: movie.vote_average || 0,
      });
      
      if (result.success) {
        addMovieId(movie.id);
      } else {
        alert(result.error || 'Failed to add to watchlist');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <button 
      onClick={toggleWatchlist}
      disabled={isLoading}
      className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 backdrop-blur-md transition-all font-semibold shadow-lg text-sm
        ${isAdded 
          ? 'bg-primary/90 text-on-primary hover:bg-primary border border-primary/50' 
          : 'bg-black/60 text-white border border-white/30 hover:bg-black/80 hover:border-white/50'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
      `}
    >
      <span 
        className="material-symbols-outlined text-[18px]"
        style={{ fontVariationSettings: isAdded ? "'FILL' 1" : "'FILL' 0" }}
      >
        {isAdded ? 'bookmark' : 'bookmark_add'}
      </span>
      {isLoading ? 'Wait...' : isAdded ? 'Remove' : 'Add to Watchlist'}
    </button>
  );
}

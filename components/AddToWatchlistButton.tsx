'use client';

import { useState, useEffect } from 'react';
import { addToWatchlist, removeFromWatchlist } from '@/app/actions/watchlist';
import { useWatchlist } from '@/providers/WatchlistProvider';

interface AddToWatchlistButtonProps {
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    genres?: { name: string }[] | string;
    vote_average: number;
  };
}

export default function AddToWatchlistButton({ movie }: AddToWatchlistButtonProps) {
  const { watchlistIds, addMovieId, removeMovieId } = useWatchlist();
  
  // If we have watchlistIds from the provider, use it directly. 
  // We assume we don't need a loading state for auth checks since the provider gets it from SSR.
  const isAdded = watchlistIds ? watchlistIds.has(movie.id) : false;
  
  const [isLoading, setIsLoading] = useState(false);

  const toggleWatchlist = async () => {
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
      let genreString = 'Movie';
      if (typeof movie.genres === 'string') {
        genreString = movie.genres;
      } else if (Array.isArray(movie.genres) && movie.genres.length > 0) {
        genreString = movie.genres[0].name;
      }

      const result = await addToWatchlist({
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        releaseYear: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
        genre: genreString,
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
      className={`px-6 h-14 border rounded-xl flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 group
        ${isAdded 
          ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20' 
          : 'border-white/30 text-white hover:bg-white/10'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span 
        className="material-symbols-outlined transition-colors group-hover:scale-110 transition-transform"
        style={{ fontVariationSettings: isAdded ? "'FILL' 1" : "'FILL' 0" }}
      >
        bookmark
      </span>
      <span className="font-semibold">
        {isLoading ? 'Loading...' : isAdded ? 'In Watchlist' : 'Add to Watchlist'}
      </span>
    </button>
  );
}

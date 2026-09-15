'use client';

import { useState } from 'react';
import MovieItem, { Movie } from '@/components/MovieItem';

interface SearchResultsProps {
  initialItems: Movie[];
  query: string;
  watchlistIds?: number[];
}

export default function SearchResults({ initialItems, query, watchlistIds }: SearchResultsProps) {
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  const movies = initialItems.filter(
    (item) => item.media_type === 'movie' || (!item.first_air_date && item.title && !item.name)
  );
  const tvShows = initialItems.filter(
    (item) => item.media_type === 'tv' || item.first_air_date || (item.name && !item.title)
  );

  const displayedItems =
    filter === 'movie' ? movies : filter === 'tv' ? tvShows : initialItems;

  return (
    <div className="space-y-8">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-primary text-surface shadow-md shadow-primary/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          All ({initialItems.length})
        </button>
        <button
          onClick={() => setFilter('movie')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            filter === 'movie'
              ? 'bg-primary text-surface shadow-md shadow-primary/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          Movies ({movies.length})
        </button>
        <button
          onClick={() => setFilter('tv')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            filter === 'tv'
              ? 'bg-primary text-surface shadow-md shadow-primary/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          TV Shows ({tvShows.length})
        </button>
      </div>

      {/* Grid of Results */}
      {displayedItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {displayedItems.map((item) => {
            const mediaType =
              item.media_type || (item.first_air_date || (item.name && !item.title) ? 'tv' : 'movie');
            return (
              <MovieItem
                key={`${mediaType}-${item.id}`}
                movie={item}
                watchlistIds={watchlistIds}
                type={mediaType}
              />
            );
          })}
        </div>
      ) : (
        <div className="w-full py-16 text-center text-on-surface-variant">
          <p className="text-lg">No {filter === 'movie' ? 'movies' : 'TV shows'} found for "{query}".</p>
        </div>
      )}
    </div>
  );
}

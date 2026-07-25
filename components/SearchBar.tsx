'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchMovies } from '@/app/actions/search';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          const searchResults = await searchMovies(query);
          setResults(searchResults);
          setIsOpen(true);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative z-50" ref={wrapperRef}>
      <div className="hidden lg:flex items-center bg-white/5 backdrop-blur-lg px-4 py-2 rounded-full border border-white/10 group focus-within:border-primary transition-all relative">
        <span className="material-symbols-outlined text-white/70 group-focus-within:text-primary">
          search
        </span>
        <input
          className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/40 w-48 outline-none ml-2 pr-6"
          placeholder="Search movies..."
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim().length > 1) setIsOpen(true); }}
        />
        {isLoading && (
          <div className="absolute right-4 w-4 h-4 border-2 border-white/20 border-t-primary rounded-full animate-spin"></div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[400px] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="max-h-[500px] overflow-y-auto hide-scrollbar p-2 space-y-2">
            {results.length === 0 && !isLoading && query.trim().length > 1 ? (
              <div className="p-4 text-center text-white/50 text-sm">
                No results found for "{query}"
              </div>
            ) : (
              results.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  onClick={handleResultClick}
                  className="flex gap-4 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group relative overflow-hidden"
                >
                  <div className="w-16 h-24 flex-shrink-0 bg-white/5 rounded-md overflow-hidden relative shadow-lg">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20">movie</span>
                      </div>
                    )}
                    {/* Rating Overlay */}
                    {movie.vote_average > 0 && (
                      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-0.5 border border-white/10">
                        <span className="material-symbols-outlined text-[10px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2 mb-0.5 pr-2">
                      <h4 className="text-white font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {movie.title}
                        {movie.release_date && (
                          <span className="text-white/50 font-normal ml-1.5">
                            ({movie.release_date.split('-')[0]})
                          </span>
                        )}
                      </h4>
                      {movie.release_date && new Date(movie.release_date) > new Date() && (
                        <span className="bg-primary/20 text-primary text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border border-primary/30 shrink-0">
                          Upcoming
                        </span>
                      )}
                    </div>
                    
                    {movie.genres && movie.genres.length > 0 && (
                      <p className="text-xs text-primary/80 mt-1 truncate">
                        {movie.genres.join(', ')}
                      </p>
                    )}
                    
                    <p className="text-xs text-white/50 mt-1.5 line-clamp-2 leading-relaxed">
                      {movie.overview}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

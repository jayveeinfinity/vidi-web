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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus mobile input when opened
  useEffect(() => {
    if (isMobileSearchOpen) {
      setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 100);
    }
  }, [isMobileSearchOpen]);

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
    setIsMobileSearchOpen(false);
    setQuery('');
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim().length > 0) {
      setIsOpen(false);
      setIsMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const renderResultItem = (item: any) => {
    const mediaType = item.media_type || (item.first_air_date || (item.name && !item.title) ? 'tv' : 'movie');
    const title = item.title || item.name;
    const releaseYear = (item.release_date || item.first_air_date)?.split('-')[0] || '';
    const releaseDate = item.release_date || item.first_air_date;

    return (
      <Link
        key={`${mediaType}-${item.id}`}
        href={`/${mediaType}/${item.id}`}
        onClick={handleResultClick}
        className="flex gap-3 md:gap-4 p-2.5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer group relative overflow-hidden"
      >
        <div className="w-14 h-20 md:w-16 md:h-24 flex-shrink-0 bg-white/5 rounded-md overflow-hidden relative shadow-lg">
          {item.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
              alt={title}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white/20">
                {mediaType === 'tv' ? 'tv' : 'movie'}
              </span>
            </div>
          )}
          {item.vote_average > 0 && (
            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-0.5 border border-white/10">
              <span className="material-symbols-outlined text-[10px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {item.vote_average.toFixed(1)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-2 mb-0.5 pr-2">
            <span className="bg-white/10 text-[9px] uppercase font-bold text-primary px-1.5 py-0.5 rounded tracking-wider shrink-0">
              {mediaType === 'tv' ? 'TV' : 'Movie'}
            </span>
            <h4 className="text-white font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {title}
              {releaseYear && (
                <span className="text-white/50 font-normal ml-1.5">
                  ({releaseYear})
                </span>
              )}
            </h4>
            {releaseDate && new Date(releaseDate) > new Date() && (
              <span className="bg-primary/20 text-primary text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border border-primary/30 shrink-0">
                Upcoming
              </span>
            )}
          </div>

          {item.genres && item.genres.length > 0 && (
            <p className="text-xs text-primary/80 mt-0.5 truncate">
              {item.genres.join(', ')}
            </p>
          )}

          <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed">
            {item.overview}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Mobile search icon button */}
      <button
        type="button"
        onClick={() => setIsMobileSearchOpen(true)}
        className="lg:hidden p-2 text-white/80 hover:text-primary transition-colors flex items-center justify-center cursor-pointer rounded-full hover:bg-white/5"
        aria-label="Open search"
      >
        <span className="material-symbols-outlined text-[22px]">search</span>
      </button>

      {/* Desktop Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden lg:flex items-center bg-white/5 backdrop-blur-lg px-4 py-2 rounded-full border border-white/10 group focus-within:border-primary transition-all relative"
      >
        <button type="submit" className="flex items-center justify-center p-0 border-0 bg-transparent cursor-pointer">
          <span className="material-symbols-outlined text-white/70 group-focus-within:text-primary transition-colors">
            search
          </span>
        </button>
        <input
          className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/40 w-48 outline-none ml-2 pr-6"
          placeholder="Search movies & TV shows..."
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim().length > 1) setIsOpen(true); }}
        />
        {isLoading && (
          <div className="absolute right-4 w-4 h-4 border-2 border-white/20 border-t-primary rounded-full animate-spin"></div>
        )}
      </form>

      {/* Desktop Search Dropdown */}
      {isOpen && (
        <div className="hidden lg:block absolute top-full right-0 mt-2 w-[420px] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl z-50">
          <div className="max-h-[500px] overflow-y-auto hide-scrollbar p-2 space-y-1">
            {results.length === 0 && !isLoading && query.trim().length > 1 ? (
              <div className="p-4 text-center text-white/50 text-sm">
                No results found for "{query}"
              </div>
            ) : (
              results.map(renderResultItem)
            )}
          </div>

          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="w-full text-center py-3 px-4 text-xs font-semibold text-primary hover:bg-white/10 transition-colors border-t border-white/10 flex items-center justify-center gap-1 cursor-pointer bg-[#151515]"
            >
              View all results for "{query}"
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile Search Overlay Modal */}
      {isMobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
          {/* Mobile Search Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-surface/80">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-1 text-white/70 hover:text-white"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center bg-white/10 rounded-full px-3.5 py-2 border border-white/15 focus-within:border-primary">
              <span className="material-symbols-outlined text-white/50 text-[20px] mr-2">search</span>
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies & TV shows..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none border-none"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-white/50 hover:text-white ml-2"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </form>

            {isLoading && (
              <div className="w-5 h-5 border-2 border-white/20 border-t-primary rounded-full animate-spin"></div>
            )}
          </div>

          {/* Mobile Search Results */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {results.length === 0 && !isLoading && query.trim().length > 1 ? (
              <div className="p-8 text-center text-white/50 text-sm">
                No results found for "{query}"
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="p-8 text-center text-white/40 text-sm">
                Type to search movies and TV series
              </div>
            ) : (
              results.map(renderResultItem)
            )}
          </div>

          {/* Mobile View All Button */}
          {query.trim().length > 0 && (
            <div className="p-3 border-t border-white/10 bg-surface/90">
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="w-full py-3 bg-primary text-surface font-semibold text-sm rounded-xl flex items-center justify-center gap-2"
              >
                View all results for "{query}"
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

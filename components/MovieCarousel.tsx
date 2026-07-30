'use client';

import { useRef } from 'react';
import MovieItem, { Movie } from './MovieItem';

interface MovieCarouselProps {
  movies: Movie[];
  title?: string;
  subtitle?: string;
  watchlistIds?: number[];
}

export default function MovieCarousel({
  movies,
  title = 'Recommended Movies',
  subtitle = 'Because you watched The Last Light',
  watchlistIds,
}: MovieCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const getScrollAmount = () => {
    if (carouselRef.current && carouselRef.current.firstElementChild) {
      const card = carouselRef.current.firstElementChild as HTMLElement;
      const gap = parseFloat(window.getComputedStyle(carouselRef.current).gap) || 24;
      return card.offsetWidth + gap;
    }
    return 280; // fallback for w-64 (256px) + gap-6 (24px)
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-container-max mx-auto px-gutter py-xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">{title}</h2>
          {subtitle && (
            <p className="text-on-surface-variant font-metadata">{subtitle}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-high hover:border-primary/50 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={scrollNext}
            className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-high hover:border-primary/50 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
      >
        {movies.map((movie) => (
          <MovieItem 
            key={movie.id} 
            movie={movie} 
            watchlistIds={watchlistIds} 
            className="flex-shrink-0 w-64" 
          />
        ))}
      </div>
    </section>
  );
}

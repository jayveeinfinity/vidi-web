'use client';

import { useRef } from 'react';
import Link from 'next/link';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

interface MovieCarouselProps {
  movies: Movie[];
  title?: string;
  subtitle?: string;
}

export default function MovieCarousel({
  movies,
  title = 'Recommended Movies',
  subtitle = 'Because you watched The Last Light',
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
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="flex-shrink-0 w-64 group cursor-pointer"
          >
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-xl">
              <img
                alt={movie.title || movie.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              {movie.vote_average && (
                <div className="absolute top-3 left-3 bg-primary text-surface text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                  <span
                    className="material-symbols-outlined text-[12px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  {movie.vote_average.toFixed(1)}
                </div>
              )}
            </div>
            <h4 className="text-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
              {movie.title || movie.name}
            </h4>
            <span className="text-xs text-secondary">
              {(movie.release_date || movie.first_air_date)?.split('-')[0] || ''}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

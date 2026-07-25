'use client';

import { useRef } from 'react';

interface Actor {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

interface CastCarouselProps {
  cast: Actor[];
}

export default function CastCarousel({ cast }: CastCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const getScrollAmount = () => {
    if (carouselRef.current && carouselRef.current.firstElementChild) {
      const card = carouselRef.current.firstElementChild as HTMLElement;
      const gap = parseFloat(window.getComputedStyle(carouselRef.current).gap) || 24;
      return card.offsetWidth + gap;
    }
    return 184; // fallback for w-40 (160px) + gap-6 (24px)
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

  if (!cast || cast.length === 0) return null;

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-headline-md font-headline-md text-on-surface">Cast</h2>
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
        {cast.map((actor) => (
          <div key={actor.id} className="flex-shrink-0 w-40 group">
            <div className="aspect-square rounded-xl overflow-hidden mb-4 border border-white/10 group-hover:border-primary/50 transition-all bg-surface-container-high">
              {actor.profile_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w300${actor.profile_path}`} 
                  alt={actor.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-white/20">person</span>
                </div>
              )}
            </div>
            <h4 className="text-white font-semibold truncate" title={actor.name}>{actor.name}</h4>
            <p className="text-secondary text-sm truncate" title={actor.character}>{actor.character}</p>
          </div>
        ))}
      </div>
    </>
  );
}

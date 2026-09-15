'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface WatchOverlayProps {
  title: string;
  year: string;
  backUrl: string;
  type?: 'movie' | 'tv';
  season?: string | number;
  episode?: string | number;
  episodeTitle?: string;
}

export default function WatchOverlay({
  title,
  year,
  backUrl,
  type,
  season,
  episode,
  episodeTitle,
}: WatchOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setIsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Hide after 3 seconds of inactivity
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Initial hide timeout
    timeout = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const isTv = type === 'tv' || (season !== undefined && episode !== undefined);

  return (
    <div 
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-gradient-to-b from-black/90 via-black/60 to-transparent pt-6 pb-12 px-8 flex items-center">
        <Link 
          href={backUrl}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white mr-6 flex-shrink-0"
          title="Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>
            {isTv && season && episode && (
              <span className="bg-primary text-surface text-xs font-bold px-2.5 py-0.5 rounded tracking-wider uppercase shadow-md shadow-primary/20">
                S{season} : E{episode}
              </span>
            )}
          </div>
          <p className="text-sm text-white/70 mt-0.5 flex items-center gap-2 flex-wrap">
            {isTv && season && episode ? (
              <>
                <span>
                  Season {season}, Episode {episode}
                  {episodeTitle ? `: "${episodeTitle}"` : ''}
                </span>
                {year && <span>• {year}</span>}
              </>
            ) : (
              year
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

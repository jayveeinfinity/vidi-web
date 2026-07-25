'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface WatchOverlayProps {
  title: string;
  year: string;
  backUrl: string;
}

export default function WatchOverlay({ title, year, backUrl }: WatchOverlayProps) {
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

  return (
    <div 
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-gradient-to-b from-black/90 via-black/60 to-transparent pt-6 pb-12 px-8 flex items-center">
        <Link 
          href={backUrl}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white mr-6"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>
          <p className="text-sm text-white/70">{year}</p>
        </div>
      </div>
    </div>
  );
}

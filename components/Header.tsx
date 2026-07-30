'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (pathname.startsWith('/watch')) return null;

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/10 ${
        scrolled ? 'bg-surface/95' : 'bg-surface/40 backdrop-blur-md'
      }`}
    >
      <nav className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center">
            <img
              alt="Vidi Logo"
              className="h-10 md:h-12 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNn1BlqAEdRyFBEBvIo6BXeSRinlbFuzlGC6c7p9ppOlQoh6WdJjktD8IjPmEHoti-gfHHNOYDJJQdWB3LkT7KeoBnFLXX0HfnmQuYOTKJ0B6J7K8ldZX23SZHmlziV7jZaoVO766Q4sH0S0iizcpRUbgbgX6L5W_6oPrZ14Uo8Rkd42jjQdqOVfjFnFs5OKow1H_fp4_njNwRTJvYJQPkkkaftVJ4Cp3ii74xwaMGqLyI9sxfSdfEvpZu1X1ylEWyC6N8YWmqEun_"
            />
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link
              href="/"
              className={
                pathname === '/'
                  ? "text-primary font-semibold border-b-2 border-primary pb-1 font-body-md text-body-md"
                  : "text-on-surface hover:text-primary transition-colors font-body-md text-body-md pb-1 border-b-2 border-transparent"
              }
            >
              Home
            </Link>
            
            <div className="relative group py-2">
              <Link
                href="/movies"
                className={
                  pathname.startsWith('/movies')
                    ? "text-primary font-semibold border-b-2 border-primary pb-1 font-body-md text-body-md flex items-center gap-1"
                    : "text-on-surface hover:text-primary transition-colors font-body-md text-body-md pb-1 border-b-2 border-transparent flex items-center gap-1"
                }
              >
                Movies
                <span className="material-symbols-outlined text-[16px] transition-transform group-hover:rotate-180">expand_more</span>
              </Link>
              <div className="absolute left-0 top-full w-48 rounded-xl bg-surface-container-highest border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50 transform translate-y-2 group-hover:translate-y-0">
                <Link href="/movies/new-releases" className="px-4 py-2.5 hover:bg-white/5 text-on-surface hover:text-primary transition-colors text-sm font-medium">New Releases</Link>
                <Link href="/movies/trending" className="px-4 py-2.5 hover:bg-white/5 text-on-surface hover:text-primary transition-colors text-sm font-medium">Trending</Link>
                <Link href="/movies/popular" className="px-4 py-2.5 hover:bg-white/5 text-on-surface hover:text-primary transition-colors text-sm font-medium">Popular</Link>
                <Link href="/movies/top-rated" className="px-4 py-2.5 hover:bg-white/5 text-on-surface hover:text-primary transition-colors text-sm font-medium">Top Rated</Link>
                <Link href="/movies/upcoming" className="px-4 py-2.5 hover:bg-white/5 text-on-surface hover:text-primary transition-colors text-sm font-medium">Upcoming</Link>
              </div>
            </div>

            <Link
              href="/tv"
              className={
                pathname.startsWith('/tv')
                  ? "text-primary font-semibold border-b-2 border-primary pb-1 font-body-md text-body-md"
                  : "text-on-surface hover:text-primary transition-colors font-body-md text-body-md pb-1 border-b-2 border-transparent"
              }
            >
              TV Shows
            </Link>

            <Link
              href="/genres"
              className={
                pathname.startsWith('/genres')
                  ? "text-primary font-semibold border-b-2 border-primary pb-1 font-body-md text-body-md"
                  : "text-on-surface hover:text-primary transition-colors font-body-md text-body-md pb-1 border-b-2 border-transparent"
              }
            >
              Genres
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <SearchBar />
          {user ? (
            <>
              <button className="relative hover:text-primary transition-all duration-300 scale-95 active:scale-90 hidden md:block">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              <Link href="/profile" className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden cursor-pointer hover:border-primary transition-all">
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  src={user.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAPfbfb8N87pc7vZKY4uHLpkRsBdFgOmEqIDE9Uh6dK50Gs8ObAxuiHUPeaxJ9TxjezBXFQkL9kkgS-XowLQ2MnAM6gR17CIfpxlBAmyRH3hh1pPDdTgfHXcQKsDjySAUAuGhEm1-FayxWK5aDt4herj5RGphFWDdAJp38-l1ghNEm9LlSC4ApIavkALtYkfmtJ3bnelgJpQjNbljEjaRWYXnC-G-EVPiJfxs9eMCGb31wUq0NGJew-auVy6qBWrq3y9UOM9plXb1Nd"}
                />
              </Link>
            </>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-primary/10 text-primary font-label-md rounded-lg hover:bg-primary/20 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

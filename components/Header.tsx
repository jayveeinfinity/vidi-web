'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoviesSubmenuOpen, setIsMoviesSubmenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

        <div className="flex items-center gap-3 md:gap-6">
          <SearchBar />

          {user ? (
            <>
              <button className="relative hover:text-primary transition-all duration-300 scale-95 active:scale-90 hidden md:block">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-primary/20 overflow-hidden cursor-pointer hover:border-primary transition-all focus:outline-none"
                >
                  <img
                    alt="User Profile"
                    className="w-full h-full object-cover"
                    src={user.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAPfbfb8N87pc7vZKY4uHLpkRsBdFgOmEqIDE9Uh6dK50Gs8ObAxuiHUPeaxJ9TxjezBXFQkL9kkgS-XowLQ2MnAM6gR17CIfpxlBAmyRH3hh1pPDdTgfHXcQKsDjySAUAuGhEm1-FayxWK5aDt4herj5RGphFWDdAJp38-l1ghNEm9LlSC4ApIavkALtYkfmtJ3bnelgJpQjNbljEjaRWYXnC-G-EVPiJfxs9eMCGb31wUq0NGJew-auVy6qBWrq3y9UOM9plXb1Nd"}
                  />
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-container-highest border border-white/10 shadow-2xl py-2 z-50 flex flex-col">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="px-4 py-2 hover:bg-white/5 text-on-surface hover:text-primary transition-colors text-sm font-medium text-left flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        Profile
                      </Link>
                      <Link
                        href="/profile/watchlist"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="px-4 py-2 hover:bg-white/5 text-on-surface hover:text-primary transition-colors text-sm font-medium text-left flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">bookmark</span>
                        My Watchlist
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="px-4 py-2 hover:bg-white/5 text-on-surface hover:text-primary transition-colors text-sm font-medium text-left flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        Settings
                      </Link>
                      <div className="h-px bg-white/10 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 hover:bg-white/5 text-error hover:text-error/80 transition-colors text-sm font-medium text-left flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="hidden sm:inline-flex px-4 py-2 bg-primary/10 text-primary font-label-md rounded-lg hover:bg-primary/20 transition-colors">
              Sign In
            </Link>
          )}

          {/* Mobile hamburger menu toggle button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-primary transition-colors flex items-center justify-center cursor-pointer rounded-lg hover:bg-white/5"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[26px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer / Dropdown */}
      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-[72px] bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="md:hidden absolute top-full left-0 right-0 max-h-[calc(100vh-72px)] overflow-y-auto bg-surface/98 backdrop-blur-2xl border-b border-white/10 shadow-2xl z-50 p-4 space-y-3 animate-in slide-in-from-top-4 duration-300">
            {/* User status card on mobile */}
            {user ? (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <img
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover border border-primary/40"
                  src={user.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAPfbfb8N87pc7vZKY4uHLpkRsBdFgOmEqIDE9Uh6dK50Gs8ObAxuiHUPeaxJ9TxjezBXFQkL9kkgS-XowLQ2MnAM6gR17CIfpxlBAmyRH3hh1pPDdTgfHXcQKsDjySAUAuGhEm1-FayxWK5aDt4herj5RGphFWDdAJp38-l1ghNEm9LlSC4ApIavkALtYkfmtJ3bnelgJpQjNbljEjaRWYXnC-G-EVPiJfxs9eMCGb31wUq0NGJew-auVy6qBWrq3y9UOM9plXb1Nd"}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 bg-primary text-surface font-semibold text-sm rounded-xl flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Sign In
              </Link>
            )}

            {/* Navigation Links */}
            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/' ? 'bg-primary/15 text-primary font-semibold' : 'text-on-surface hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                Home
              </Link>

              {/* Movies with accordion */}
              <div>
                <div
                  onClick={() => setIsMoviesSubmenuOpen(!isMoviesSubmenuOpen)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    pathname.startsWith('/movies') ? 'bg-primary/15 text-primary font-semibold' : 'text-on-surface hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">movie</span>
                    Movies
                  </div>
                  <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isMoviesSubmenuOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>

                {isMoviesSubmenuOpen && (
                  <div className="ml-8 pl-3 border-l border-white/10 mt-1 space-y-1 py-1">
                    <Link
                      href="/movies"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-1.5 text-xs text-white/70 hover:text-primary transition-colors"
                    >
                      All Movies
                    </Link>
                    <Link
                      href="/movies/new-releases"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-1.5 text-xs text-white/70 hover:text-primary transition-colors"
                    >
                      New Releases
                    </Link>
                    <Link
                      href="/movies/trending"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-1.5 text-xs text-white/70 hover:text-primary transition-colors"
                    >
                      Trending
                    </Link>
                    <Link
                      href="/movies/popular"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-1.5 text-xs text-white/70 hover:text-primary transition-colors"
                    >
                      Popular
                    </Link>
                    <Link
                      href="/movies/top-rated"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-1.5 text-xs text-white/70 hover:text-primary transition-colors"
                    >
                      Top Rated
                    </Link>
                    <Link
                      href="/movies/upcoming"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-1.5 text-xs text-white/70 hover:text-primary transition-colors"
                    >
                      Upcoming
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/tv"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/tv') ? 'bg-primary/15 text-primary font-semibold' : 'text-on-surface hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">tv</span>
                TV Shows
              </Link>

              <Link
                href="/genres"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/genres') ? 'bg-primary/15 text-primary font-semibold' : 'text-on-surface hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">category</span>
                Genres
              </Link>

              {user && (
                <>
                  <div className="h-px bg-white/10 my-2" />
                  <Link
                    href="/profile/watchlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface hover:bg-white/5"
                  >
                    <span className="material-symbols-outlined text-[20px]">bookmark</span>
                    My Watchlist
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface hover:bg-white/5"
                  >
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-white/5 w-full text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}

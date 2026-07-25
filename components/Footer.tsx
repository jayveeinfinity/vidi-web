'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/watch')) return null;

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20 w-full mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-gutter py-lg max-w-container-max mx-auto gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="flex items-center">
            <img
              alt="Vidi Logo"
              className="h-8 md:h-10 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNn1BlqAEdRyFBEBvIo6BXeSRinlbFuzlGC6c7p9ppOlQoh6WdJjktD8IjPmEHoti-gfHHNOYDJJQdWB3LkT7KeoBnFLXX0HfnmQuYOTKJ0B6J7K8ldZX23SZHmlziV7jZaoVO766Q4sH0S0iizcpRUbgbgX6L5W_6oPrZ14Uo8Rkd42jjQdqOVfjFnFs5OKow1H_fp4_njNwRTJvYJQPkkkaftVJ4Cp3ii74xwaMGqLyI9sxfSdfEvpZu1X1ylEWyC6N8YWmqEun_"
            />
          </Link>
          <p className="text-on-surface/60 font-metadata text-xs text-center md:text-left">
            © {new Date().getFullYear()} Vidi. We use TMDB for movie data.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
              <img
                alt="TMDB Logo"
                className="h-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              />
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <Link
            href="/about"
            className="text-on-surface hover:text-primary transition-colors font-metadata text-xs opacity-70 hover:opacity-100"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-on-surface hover:text-primary transition-colors font-metadata text-xs opacity-70 hover:opacity-100"
          >
            Contact Us
          </Link>
          <Link
            href="/terms"
            className="text-on-surface hover:text-primary transition-colors font-metadata text-xs opacity-70 hover:opacity-100"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-on-surface hover:text-primary transition-colors font-metadata text-xs opacity-70 hover:opacity-100"
          >
            Privacy Policy
          </Link>
          <Link
            href="/help"
            className="text-on-surface hover:text-primary transition-colors font-metadata text-xs opacity-70 hover:opacity-100"
          >
            Help Center
          </Link>
        </div>
        <div className="flex gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/20 hover:text-primary hover:border-primary/50 transition-all">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

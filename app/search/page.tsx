import Link from 'next/link';
import { searchMulti } from '@/lib/tmdb';
import { createClient } from '@/utils/supabase/server';
import { WatchlistProvider } from '@/providers/WatchlistProvider';
import SearchResults from '@/components/SearchResults';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; query?: string }>;
}) {
  const { q, query: queryParam } = await searchParams;
  const query = (q || queryParam || '').trim();

  let items: any[] = [];
  if (query) {
    items = await searchMulti(query, 40);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let watchlistIds: number[] | undefined = undefined;
  if (user) {
    const { data } = await supabase.from('watchlists').select('movie_id').eq('user_id', user.id);
    if (data) {
      watchlistIds = data.map((item) => item.movie_id);
    }
  }

  return (
    <WatchlistProvider initialWatchlistIds={watchlistIds}>
      <main className="flex-grow pt-28 px-gutter max-w-container-max mx-auto w-full min-h-[calc(100vh-160px)] pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Search</span>
          </div>

          {query ? (
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-2">
                Search results for <span className="text-primary">"{query}"</span>
              </h1>
              <p className="text-on-surface-variant text-body-md">
                Found {items.length} {items.length === 1 ? 'title' : 'titles'} matching your search.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-2">
                Search Movies & TV Shows
              </h1>
              <p className="text-on-surface-variant text-body-md">
                Explore thousands of movies, TV series, and trending entertainment.
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        {!query ? (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-low/50">
            <span className="material-symbols-outlined text-6xl text-primary/60">search</span>
            <h2 className="text-xl font-bold text-white">Looking for something to watch?</h2>
            <p className="text-on-surface-variant max-w-md">
              Type a movie title, TV show, or franchise name in the search bar above to begin.
            </p>
          </div>
        ) : items.length > 0 ? (
          <SearchResults initialItems={items} query={query} watchlistIds={watchlistIds} />
        ) : (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-low/50">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/40">
              sentiment_dissatisfied
            </span>
            <h2 className="text-2xl font-bold text-white">No results found</h2>
            <p className="text-on-surface-variant max-w-md">
              We couldn't find any movies or TV shows matching <span className="text-white font-semibold">"{query}"</span>. Please try another keyword or check for spelling errors.
            </p>
            <div className="flex gap-4 pt-4">
              <Link
                href="/movies"
                className="px-6 py-2.5 rounded-xl bg-primary text-surface font-semibold hover:brightness-110 transition-all"
              >
                Browse Movies
              </Link>
              <Link
                href="/tv"
                className="px-6 py-2.5 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
              >
                Browse TV Shows
              </Link>
            </div>
          </div>
        )}
      </main>
    </WatchlistProvider>
  );
}

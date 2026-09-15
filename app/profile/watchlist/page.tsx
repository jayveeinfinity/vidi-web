import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import MovieItem from '@/components/MovieItem';
import { WatchlistProvider } from '@/providers/WatchlistProvider';

export default async function WatchlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: watchlists } = await supabase
    .from('watchlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const watchlistIds = watchlists?.map(w => w.movie_id) || [];

  return (
    <WatchlistProvider initialWatchlistIds={watchlistIds}>
      <main className="flex-grow pt-24 px-gutter max-w-container-max mx-auto w-full min-h-[calc(100vh-160px)]">
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-on-surface">My Watchlist</h1>
          <p className="text-on-surface-variant mt-2">All the movies you've saved to watch later.</p>
        </div>

        {watchlists && watchlists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watchlists.map((movie) => (
              <MovieItem
                key={movie.id}
                movie={movie as any}
                watchlistIds={watchlistIds}
              />
            ))}
          </div>
        ) : (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low/50">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">movie</span>
            <p className="text-on-surface-variant text-lg">Your watchlist is completely empty.</p>
            <Link href="/" className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all">Browse Movies</Link>
          </div>
        )}
      </main>
    </WatchlistProvider>
  );
}

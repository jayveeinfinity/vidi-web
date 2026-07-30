import { getMovieListByCategory } from '@/lib/tmdb';
import MovieItem from '@/components/MovieItem';
import { createClient } from '@/utils/supabase/server';
import { WatchlistProvider } from '@/providers/WatchlistProvider';
import { notFound } from 'next/navigation';

export default async function MoviesCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  const validCategories = ['new-releases', 'trending', 'popular', 'top-rated', 'upcoming'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  const movies = await getMovieListByCategory(category, 30);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let watchlistIds: number[] | undefined = undefined;
  if (user) {
    const { data } = await supabase.from('watchlists').select('movie_id').eq('user_id', user.id);
    if (data) {
      watchlistIds = data.map((item) => item.movie_id);
    }
  }

  const formatCategoryTitle = (cat: string) => {
    return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <WatchlistProvider initialWatchlistIds={watchlistIds}>
      <main className="flex-grow pt-24 px-gutter max-w-container-max mx-auto w-full min-h-[calc(100vh-160px)]">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-2">
            {formatCategoryTitle(category)} Movies
          </h1>
          <p className="text-on-surface-variant text-body-md">
            Discover the best {formatCategoryTitle(category).toLowerCase()} movies right now.
          </p>
        </div>

        {movies && movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((movie: any) => (
              <MovieItem 
                key={movie.id} 
                movie={movie} 
                watchlistIds={watchlistIds} 
              />
            ))}
          </div>
        ) : (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low/50">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">movie</span>
            <p className="text-on-surface-variant text-lg">No movies found for this category.</p>
          </div>
        )}
      </main>
    </WatchlistProvider>
  );
}

import Link from 'next/link';
import { getTrending, getMovieImages, getMovieDetails, getMoviesByCategory, getMoviesByOriginCountry } from '@/lib/tmdb';
import MovieCarousel from '@/components/MovieCarousel';
import { createClient } from '@/utils/supabase/server';
import AddToWatchlistButton from '@/components/AddToWatchlistButton';

import { WatchlistProvider } from '@/providers/WatchlistProvider';

export default async function HomePage() {
  const [
    movies,
    popularMovies,
    topRatedMovies,
    upcomingMovies,
    phMovies
  ] = await Promise.all([
    getTrending('movie'),
    getMoviesByCategory('popular'),
    getMoviesByCategory('top_rated'),
    getMoviesByCategory('upcoming'),
    getMoviesByOriginCountry('PH'),
  ]);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let watchlistIds: number[] | undefined = undefined;
  if (user) {
    const { data } = await supabase.from('watchlists').select('movie_id').eq('user_id', user.id);
    if (data) {
      watchlistIds = data.map((item) => item.movie_id);
    }
  }

  if (!movies || movies.length === 0) {
    return <main className="min-h-screen pt-24 px-8">No movies found.</main>;
  }

  const heroMovie = movies[0];
  const carouselMovies = movies.slice(1);
  const heroImages = await getMovieImages(heroMovie.id, 'movie');
  const heroLogo = heroImages?.logos?.find((l: any) => l.iso_639_1 === 'en') || heroImages?.logos?.[0];
  
  const heroDetails = await getMovieDetails(heroMovie.id, 'movie');
  let certification = '';
  if (heroDetails?.release_dates?.results) {
    const usRelease = heroDetails.release_dates.results.find((r: any) => r.iso_3166_1 === 'US');
    if (usRelease && usRelease.release_dates?.length > 0) {
      certification = usRelease.release_dates.find((d: any) => d.certification)?.certification || '';
    }
  }
  const genres = heroDetails?.genres?.map((g: any) => g.name).slice(0, 3).join(', ') || '';

  return (
    <WatchlistProvider initialWatchlistIds={watchlistIds}>
      <main>
        {/* Hero Section */}
        <section className="relative h-screen min-h-[700px] w-full flex items-center overflow-hidden">
        {/* Full-width Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img
            alt={`${heroMovie.title} Backdrop`}
            className="w-full h-full object-cover object-center"
            src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`}
          />
          {/* Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40"></div>
        </div>

        {/* Movie Information Content */}
        <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter">
          <div className="max-w-2xl space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-primary text-surface text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                  Trending #1
                </span>
                <span className="text-primary text-label-sm font-label-sm tracking-widest uppercase">
                  Movie • {heroMovie.release_date?.split('-')[0]}
                </span>
              </div>
              {heroLogo ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${heroLogo.file_path}`}
                  alt={heroMovie.title}
                  className="w-64 md:w-96 max-h-32 object-contain object-left"
                />
              ) : (
                <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-white leading-tight tracking-tighter">
                  {heroMovie.title}
                </h1>
              )}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-sm"
                        style={{
                          fontVariationSettings: i < Math.round(heroMovie.vote_average / 2) ? "'FILL' 1" : "'FILL' 0",
                          opacity: i < Math.round(heroMovie.vote_average / 2) ? 1 : 0.3,
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="font-metadata text-sm text-white/80">
                    TMDB Rating: <span className="text-primary font-bold">{heroMovie.vote_average?.toFixed(1)}/10</span>
                  </span>
                  {certification && (
                    <span className="px-2 py-0.5 rounded border border-white/20 text-[10px] uppercase font-bold tracking-widest text-white/80 backdrop-blur-md">
                      {certification}
                    </span>
                  )}
                  {genres && (
                    <span className="text-xs text-white/60 ml-2">
                      {genres}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-body-md md:text-body-lg text-white/90 leading-relaxed line-clamp-3 md:line-clamp-none">
              {heroMovie.overview}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href={`/movie/${heroMovie.id}`}
                className="bg-primary text-surface font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                Watch Now
              </Link>
              {watchlistIds !== undefined ? (
                <AddToWatchlistButton 
                  movie={{
                    id: heroMovie.id,
                    title: heroMovie.title,
                    poster_path: heroMovie.poster_path,
                    release_date: heroMovie.release_date,
                    genre: genres,
                    vote_average: heroMovie.vote_average
                  }}
                />
              ) : (
                <button className="px-6 h-14 border border-white/30 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 backdrop-blur-md transition-all active:scale-95 group opacity-50 cursor-not-allowed" title="Log in to use Watchlist">
                  <span className="material-symbols-outlined group-hover:text-primary transition-transform">
                    bookmark
                  </span>
                  <span className="font-semibold">Add to Watchlist</span>
                </button>
              )}
              <button className="w-14 h-14 border border-white/30 text-white rounded-xl flex items-center justify-center hover:bg-white/10 backdrop-blur-md transition-all active:scale-95 group">
                <span className="material-symbols-outlined group-hover:text-primary">
                  share
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Carousel */}
      <MovieCarousel 
        movies={carouselMovies} 
        title="Trending Movies" 
        subtitle="Popular right now"
        watchlistIds={watchlistIds}
      />

      {popularMovies?.length > 0 && (
        <MovieCarousel 
          movies={popularMovies} 
          title="Popular Movies" 
          subtitle="What everyone is watching"
          watchlistIds={watchlistIds}
        />
      )}

      {topRatedMovies?.length > 0 && (
        <MovieCarousel 
          movies={topRatedMovies} 
          title="Top Rated" 
          subtitle="Critically acclaimed masterpieces"
          watchlistIds={watchlistIds}
        />
      )}

      {upcomingMovies?.length > 0 && (
        <MovieCarousel 
          movies={upcomingMovies} 
          title="Upcoming Movies" 
          subtitle="Catch them in theaters soon"
          watchlistIds={watchlistIds}
        />
      )}

      {phMovies?.length > 0 && (
        <MovieCarousel 
          movies={phMovies} 
          title="Philippine Cinema" 
          subtitle="Top hits and classics from the Philippines"
          watchlistIds={watchlistIds}
        />
      )}
    </main>
    </WatchlistProvider>
  );
}
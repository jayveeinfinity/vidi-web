import Link from 'next/link';
import { getTrending, getMovieImages, getMovieDetails, getTVByCategory } from '@/lib/tmdb';
import MovieCarousel from '@/components/MovieCarousel';
import { createClient } from '@/utils/supabase/server';
import AddToWatchlistButton from '@/components/AddToWatchlistButton';
import { WatchlistProvider } from '@/providers/WatchlistProvider';

export default async function TVPage() {
  const [
    trendingTv,
    popularTv,
    topRatedTv,
    onTheAirTv,
  ] = await Promise.all([
    getTrending('tv'),
    getTVByCategory('popular'),
    getTVByCategory('top_rated'),
    getTVByCategory('on_the_air'),
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

  if (!trendingTv || trendingTv.length === 0) {
    return <main className="min-h-screen pt-24 px-8">No TV series found.</main>;
  }

  const heroTv = trendingTv[0];
  const carouselTv = trendingTv.slice(1);

  const heroImages = await getMovieImages(heroTv.id, 'tv');
  const heroLogo = heroImages?.logos?.find((l: any) => l.iso_639_1 === 'en') || heroImages?.logos?.[0];

  const heroDetails = await getMovieDetails(heroTv.id, 'tv');
  let rating = '';
  if (heroDetails?.content_ratings?.results) {
    const usRating = heroDetails.content_ratings.results.find((r: any) => r.iso_3166_1 === 'US');
    if (usRating) {
      rating = usRating.rating;
    }
  }

  const genres = heroDetails?.genres?.map((g: any) => g.name).slice(0, 3).join(', ') || '';
  const firstAirYear = heroTv.first_air_date ? heroTv.first_air_date.split('-')[0] : '';

  return (
    <WatchlistProvider initialWatchlistIds={watchlistIds}>
      <main>
        {/* Hero Section */}
        <section className="relative h-screen min-h-[700px] w-full flex items-center overflow-hidden">
          {/* Full-width Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              alt={`${heroTv.name} Backdrop`}
              className="w-full h-full object-cover object-center"
              src={`https://image.tmdb.org/t/p/original${heroTv.backdrop_path || heroTv.poster_path}`}
            />
            {/* Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40"></div>
          </div>

          {/* TV Show Information Content */}
          <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-surface text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                    Trending #1
                  </span>
                  <span className="text-primary text-label-sm font-label-sm tracking-widest uppercase">
                    TV Series{firstAirYear ? ` • ${firstAirYear}` : ''}
                  </span>
                </div>
                {heroLogo ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${heroLogo.file_path}`}
                    alt={heroTv.name}
                    className="w-64 md:w-96 max-h-32 object-contain object-left"
                  />
                ) : (
                  <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-white leading-tight tracking-tighter">
                    {heroTv.name}
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
                            fontVariationSettings: i < Math.round((heroTv.vote_average || 0) / 2) ? "'FILL' 1" : "'FILL' 0",
                            opacity: i < Math.round((heroTv.vote_average || 0) / 2) ? 1 : 0.3,
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="font-metadata text-sm text-white/80">
                      TMDB Rating: <span className="text-primary font-bold">{heroTv.vote_average?.toFixed(1)}/10</span>
                    </span>
                    {rating && (
                      <span className="px-2 py-0.5 rounded border border-white/20 text-[10px] uppercase font-bold tracking-widest text-white/80 backdrop-blur-md">
                        {rating}
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
                {heroTv.overview}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href={`/tv/${heroTv.id}`}
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
                      id: heroTv.id,
                      name: heroTv.name,
                      poster_path: heroTv.poster_path,
                      first_air_date: heroTv.first_air_date,
                      genres: genres,
                      vote_average: heroTv.vote_average,
                    }}
                  />
                ) : (
                  <button
                    className="px-6 h-14 border border-white/30 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 backdrop-blur-md transition-all active:scale-95 group opacity-50 cursor-not-allowed"
                    title="Log in to use Watchlist"
                  >
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

        {/* Trending TV Shows Carousel */}
        <MovieCarousel
          movies={carouselTv}
          title="Trending TV Shows"
          subtitle="Popular right now"
          watchlistIds={watchlistIds}
          type="tv"
        />

        {/* Popular TV Shows Carousel */}
        {popularTv?.length > 0 && (
          <MovieCarousel
            movies={popularTv}
            title="Popular TV Shows"
            subtitle="What everyone is watching"
            watchlistIds={watchlistIds}
            type="tv"
          />
        )}

        {/* Top Rated TV Shows Carousel */}
        {topRatedTv?.length > 0 && (
          <MovieCarousel
            movies={topRatedTv}
            title="Top Rated"
            subtitle="Critically acclaimed masterpieces"
            watchlistIds={watchlistIds}
            type="tv"
          />
        )}

        {/* Upcoming / On The Air TV Shows Carousel */}
        {onTheAirTv?.length > 0 && (
          <MovieCarousel
            movies={onTheAirTv}
            title="Upcoming & Airing"
            subtitle="Fresh episodes and new seasons airing soon"
            watchlistIds={watchlistIds}
            type="tv"
          />
        )}
      </main>
    </WatchlistProvider>
  );
}

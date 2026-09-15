import Link from 'next/link';
import { getMovieDetails, getMovieImages, getTVSeasonDetails } from '@/lib/tmdb';
import MovieCarousel from '@/components/MovieCarousel';
import CastCarousel from '@/components/CastCarousel';
import AddToWatchlistButton from '@/components/AddToWatchlistButton';
import TVEpisodesSection from '@/components/TVEpisodesSection';
import { createClient } from '@/utils/supabase/server';
import { WatchlistProvider } from '@/providers/WatchlistProvider';

export default async function TVDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tv = await getMovieDetails(id, 'tv');

  if (!tv) {
    return <main className="min-h-screen pt-24 px-8">TV Series not found.</main>;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let watchlistIds: number[] | undefined = undefined;
  if (user) {
    const { data } = await supabase.from('watchlists').select('movie_id').eq('user_id', user.id);
    if (data) {
      watchlistIds = data.map((item) => item.movie_id);
    }
  }

  const images = await getMovieImages(id, 'tv');
  const logo = images?.logos?.find((l: any) => l.iso_639_1 === 'en') || images?.logos?.[0];

  let certification = '';
  if (tv.content_ratings?.results) {
    const usRating = tv.content_ratings.results.find((r: any) => r.iso_3166_1 === 'US');
    if (usRating) {
      certification = usRating.rating;
    } else if (tv.content_ratings.results.length > 0) {
      certification = tv.content_ratings.results[0].rating || '';
    }
  }

  const genres = tv.genres?.map((g: any) => g.name).join(', ') || '';
  const creators = tv.created_by?.map((c: any) => c.name).join(', ') || 'Unknown';
  const networks = tv.networks?.map((n: any) => n.name).join(', ') || 'Unknown';

  const cast = tv.credits?.cast?.slice(0, 10) || [];
  const gallery = tv.images?.backdrops?.slice(0, 6) || [];
  const reviews = tv.reviews?.results?.slice(0, 4) || [];
  const recommendations = tv.recommendations?.results || [];
  const seasons = (tv.seasons || []).filter((s: any) => s.season_number > 0);
  const firstSeasonNumber = seasons[0]?.season_number || 1;
  const initialSeason = await getTVSeasonDetails(id, firstSeasonNumber);
  const initialEpisodes = initialSeason?.episodes || [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const firstAirYear = tv.first_air_date ? tv.first_air_date.split('-')[0] : '';

  return (
    <WatchlistProvider initialWatchlistIds={watchlistIds}>
      <main>
        {/* Immersive Hero Section */}
        <section className="relative h-screen min-h-[700px] w-full flex items-end overflow-hidden">
          {/* Full-width Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              alt={`${tv.name} Backdrop`}
              className="w-full h-full object-cover object-center"
              src={`https://image.tmdb.org/t/p/original${tv.backdrop_path || tv.poster_path}`}
            />
            {/* Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40"></div>
          </div>

          {/* TV Series Information Content */}
          <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter pb-xl md:pb-24">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {tv.status && (
                    <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                      {tv.status}
                    </span>
                  )}
                  <span className="text-primary text-label-sm font-label-sm tracking-widest uppercase">
                    {tv.genres?.[0]?.name || 'TV Series'}{firstAirYear ? ` • ${firstAirYear}` : ''}
                  </span>
                </div>

                {logo ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${logo.file_path}`}
                    alt={tv.name}
                    className="w-64 md:w-96 max-h-32 object-contain object-left mb-4"
                  />
                ) : (
                  <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-white leading-tight tracking-tighter">
                    {tv.name}
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
                            fontVariationSettings: i < Math.round((tv.vote_average || 0) / 2) ? "'FILL' 1" : "'FILL' 0",
                            opacity: i < Math.round((tv.vote_average || 0) / 2) ? 1 : 0.3,
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="font-metadata text-sm text-white/80">
                      TMDB Rating: <span className="text-white font-bold">{tv.vote_average?.toFixed(1)}/10</span>
                    </span>
                  </div>
                  {certification && (
                    <span className="px-2 py-0.5 rounded border border-white/20 text-[10px] uppercase font-bold tracking-widest text-white/80 backdrop-blur-md">
                      {certification}
                    </span>
                  )}
                  <span className="text-xs text-white/60">
                    {tv.number_of_seasons} {tv.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                  </span>
                </div>
              </div>

              <p className="text-body-md md:text-body-lg text-white/90 leading-relaxed line-clamp-3 md:line-clamp-none">
                {tv.overview}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href={`/watch/tv/${tv.id}?s=1&e=1`}
                  className="bg-primary text-on-primary font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/40"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  Watch Now
                </Link>
                <AddToWatchlistButton
                  movie={{
                    id: tv.id,
                    name: tv.name,
                    poster_path: tv.poster_path,
                    first_air_date: tv.first_air_date,
                    genres: genres,
                    vote_average: tv.vote_average,
                  }}
                />
                <button className="w-14 h-14 border border-white/30 text-white rounded-xl flex items-center justify-center hover:bg-white/10 backdrop-blur-md transition-all active:scale-95 hover:text-primary">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TV Series Details & Metadata */}
        <section className="max-w-container-max mx-auto px-gutter py-xl border-b border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            <div className="space-y-1">
              <p className="text-secondary text-xs uppercase tracking-widest font-bold">First Air Date</p>
              <p className="text-white font-semibold">{formatDate(tv.first_air_date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-secondary text-xs uppercase tracking-widest font-bold">Last Air Date</p>
              <p className="text-white font-semibold">{formatDate(tv.last_air_date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-secondary text-xs uppercase tracking-widest font-bold">Seasons & Episodes</p>
              <p className="text-white font-semibold">
                {tv.number_of_seasons} S • {tv.number_of_episodes} Eps
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-secondary text-xs uppercase tracking-widest font-bold">Genre</p>
              <p className="text-white font-semibold truncate" title={genres}>{genres || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-secondary text-xs uppercase tracking-widest font-bold">Language</p>
              <p className="text-white font-semibold">{tv.spoken_languages?.[0]?.english_name || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-secondary text-xs uppercase tracking-widest font-bold">Network</p>
              <p className="text-white font-semibold truncate" title={networks}>{networks}</p>
            </div>
          </div>
        </section>

        {/* Episodes per Season Section */}
        {seasons.length > 0 && (
          <TVEpisodesSection
            tvId={tv.id}
            tvTitle={tv.name}
            backdropPath={tv.backdrop_path}
            seasons={seasons}
            initialEpisodes={initialEpisodes}
            initialSeasonNumber={firstSeasonNumber}
          />
        )}

        {/* Cast & Crew */}
        {cast.length > 0 && (
          <section className="max-w-container-max mx-auto px-gutter py-xl">
            <CastCarousel cast={cast} />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
              <div>
                <p className="text-secondary text-xs uppercase tracking-widest font-bold mb-2">Created By</p>
                <p className="text-white font-semibold">{creators}</p>
              </div>
              <div>
                <p className="text-secondary text-xs uppercase tracking-widest font-bold mb-2">Original Networks</p>
                <p className="text-white font-semibold">{networks}</p>
              </div>
            </div>
          </section>
        )}

        {/* Media Gallery */}
        {gallery.length > 0 && (
          <section className="bg-surface-container-low py-xl">
            <div className="max-w-container-max mx-auto px-gutter">
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-headline-md font-headline-md text-on-surface">Media Gallery</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gallery.map((img: any, idx: number) => (
                  <div
                    key={idx}
                    className="aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer group bg-surface-container-high"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w780${img.file_path}`}
                      alt={`Series Still ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* User Reviews */}
        {reviews.length > 0 && (
          <section className="max-w-container-max mx-auto px-gutter py-xl">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-headline-md font-headline-md text-on-surface">User Reviews</h2>
              <button className="bg-white/5 hover:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg border border-white/10 transition-colors text-sm">
                Write a Review
              </button>
            </div>
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0c0f0fcc] backdrop-blur-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                        {review.author_details?.avatar_path ? (
                          <img
                            src={
                              review.author_details.avatar_path.startsWith('/')
                                ? `https://image.tmdb.org/t/p/w200${review.author_details.avatar_path}`
                                : review.author_details.avatar_path.substring(1)
                            }
                            alt={review.author}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-white/40">person</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{review.author}</h4>
                        <p className="text-secondary text-xs">
                          Reviewed on{' '}
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {review.author_details?.rating && (
                      <div className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="font-bold">{review.author_details.rating}/10</span>
                      </div>
                    )}
                  </div>
                  <p className="text-white/80 italic leading-relaxed line-clamp-4">
                    "{review.content}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Series */}
        {recommendations.length > 0 && (
          <div className="py-xl">
            <MovieCarousel
              movies={recommendations}
              title="Recommended Series"
              subtitle={`Because you watched ${tv.name}`}
              watchlistIds={watchlistIds}
              type="tv"
            />
          </div>
        )}
      </main>
    </WatchlistProvider>
  );
}

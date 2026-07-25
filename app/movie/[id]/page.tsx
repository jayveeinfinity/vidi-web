import Link from 'next/link';
import { getMovieDetails, getMovieImages } from '@/lib/tmdb';
import MovieCarousel from '@/components/MovieCarousel';
import CastCarousel from '@/components/CastCarousel';

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovieDetails(id, 'movie');
  
  if (!movie) {
    return <main className="min-h-screen pt-24 px-8">Movie not found.</main>;
  }

  const images = await getMovieImages(id, 'movie');
  const logo = images?.logos?.find((l: any) => l.iso_639_1 === 'en') || images?.logos?.[0];

  let certification = '';
  if (movie.release_dates?.results) {
    const usRelease = movie.release_dates.results.find((r: any) => r.iso_3166_1 === 'US');
    if (usRelease && usRelease.release_dates?.length > 0) {
      certification = usRelease.release_dates.find((d: any) => d.certification)?.certification || '';
    }
  }

  const genres = movie.genres?.map((g: any) => g.name).join(', ') || '';
  const director = movie.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown';
  const producers = movie.credits?.crew?.filter((c: any) => c.job === 'Producer').map((c: any) => c.name).join(', ') || 'Unknown';
  const screenplay = movie.credits?.crew?.filter((c: any) => c.job === 'Screenplay' || c.job === 'Writer').map((c: any) => c.name).join(', ') || 'Unknown';
  
  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const gallery = movie.images?.backdrops?.slice(0, 6) || [];
  const reviews = movie.reviews?.results?.slice(0, 4) || [];
  const recommendations = movie.recommendations?.results || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    if (!minutes) return 'Unknown';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  return (
    <main>
      {/* Immersive Hero Section */}
      <section className="relative h-screen min-h-[700px] w-full flex items-end overflow-hidden">
        {/* Full-width Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img
            alt={`${movie.title} Backdrop`}
            className="w-full h-full object-cover object-center"
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
          />
          {/* Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40"></div>
        </div>

        {/* Movie Information Content */}
        <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter pb-xl md:pb-24">
          <div className="max-w-2xl space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {movie.status === 'Released' && (
                  <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    Released
                  </span>
                )}
                <span className="text-primary text-label-sm font-label-sm tracking-widest uppercase">
                  {movie.genres?.[0]?.name || 'Movie'} • {movie.release_date?.split('-')[0]}
                </span>
              </div>
              
              {logo ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${logo.file_path}`}
                  alt={movie.title}
                  className="w-64 md:w-96 max-h-32 object-contain object-left mb-4"
                />
              ) : (
                <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-white leading-tight tracking-tighter">
                  {movie.title}
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
                          fontVariationSettings: i < Math.round(movie.vote_average / 2) ? "'FILL' 1" : "'FILL' 0",
                          opacity: i < Math.round(movie.vote_average / 2) ? 1 : 0.3,
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="font-metadata text-sm text-white/80">
                    TMDB Rating: <span className="text-white font-bold">{movie.vote_average?.toFixed(1)}/10</span>
                  </span>
                </div>
                {certification && (
                  <span className="px-2 py-0.5 rounded border border-white/20 text-[10px] uppercase font-bold tracking-widest text-white/80 backdrop-blur-md">
                    {certification}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-body-md md:text-body-lg text-white/90 leading-relaxed line-clamp-3 md:line-clamp-none">
              {movie.overview}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href={`/watch/movie/${movie.id}`} className="bg-primary text-on-primary font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/40">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Watch Now
              </Link>
              <button className="px-6 h-14 border border-white/30 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 backdrop-blur-md transition-all active:scale-95 group">
                <span className="material-symbols-outlined group-hover:text-primary transition-colors group-hover:scale-110 transition-transform">bookmark</span>
                <span className="font-semibold">Add to Watchlist</span>
              </button>
              <button className="w-14 h-14 border border-white/30 text-white rounded-xl flex items-center justify-center hover:bg-white/10 backdrop-blur-md transition-all active:scale-95 hover:text-primary">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Movie Details & Metadata */}
      <section className="max-w-container-max mx-auto px-gutter py-xl border-b border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="space-y-1">
            <p className="text-secondary text-xs uppercase tracking-widest font-bold">Release Date</p>
            <p className="text-white font-semibold">
              {movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-secondary text-xs uppercase tracking-widest font-bold">Runtime</p>
            <p className="text-white font-semibold">{formatRuntime(movie.runtime)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-secondary text-xs uppercase tracking-widest font-bold">Genre</p>
            <p className="text-white font-semibold">{genres}</p>
          </div>
          <div className="space-y-1">
            <p className="text-secondary text-xs uppercase tracking-widest font-bold">Language</p>
            <p className="text-white font-semibold">{movie.spoken_languages?.[0]?.english_name || 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-secondary text-xs uppercase tracking-widest font-bold">Budget</p>
            <p className="text-white font-semibold">{movie.budget > 0 ? formatCurrency(movie.budget) : 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-secondary text-xs uppercase tracking-widest font-bold">Revenue</p>
            <p className="text-white font-semibold">{movie.revenue > 0 ? formatCurrency(movie.revenue) : 'Unknown'}</p>
          </div>
        </div>
      </section>

      {/* Cast & Crew */}
      {cast.length > 0 && (
        <section className="max-w-container-max mx-auto px-gutter py-xl">
          <CastCarousel cast={cast} />
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
            <div>
              <p className="text-secondary text-xs uppercase tracking-widest font-bold mb-2">Director</p>
              <p className="text-white font-semibold">{director}</p>
            </div>
            <div>
              <p className="text-secondary text-xs uppercase tracking-widest font-bold mb-2">Producers</p>
              <p className="text-white font-semibold">{producers}</p>
            </div>
            <div>
              <p className="text-secondary text-xs uppercase tracking-widest font-bold mb-2">Screenplay</p>
              <p className="text-white font-semibold">{screenplay}</p>
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
                <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer group bg-surface-container-high">
                  <img 
                    src={`https://image.tmdb.org/t/p/w780${img.file_path}`} 
                    alt={`Movie Still ${idx + 1}`} 
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
              <div key={review.id} className="glass-panel p-6 rounded-2xl border-white/5 bg-[#0c0f0fcc] backdrop-blur-md border border-[#d4af3733]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                      {review.author_details?.avatar_path ? (
                        <img 
                          src={review.author_details.avatar_path.startsWith('/') ? `https://image.tmdb.org/t/p/w200${review.author_details.avatar_path}` : review.author_details.avatar_path.substring(1)} 
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
                        Reviewed on {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {review.author_details?.rating && (
                    <div className="flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
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

      {/* Recommended Movies */}
      {recommendations.length > 0 && (
        <div className="py-xl">
          <MovieCarousel 
            movies={recommendations} 
            title="Recommended Movies" 
            subtitle={`Because you watched ${movie.title}`}
          />
        </div>
      )}
    </main>
  );
}

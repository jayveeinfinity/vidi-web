import Link from 'next/link';
import CarouselWatchlistButton from './CarouselWatchlistButton';

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  movie_id?: number; // for watchlist compatibility
  release_year?: string; // for watchlist compatibility
  media_type?: 'movie' | 'tv';
  genre?: string;
}

interface MovieItemProps {
  movie: Movie;
  watchlistIds?: number[];
  className?: string;
  type?: 'movie' | 'tv';
}

export default function MovieItem({ movie, watchlistIds, className = '', type }: MovieItemProps) {
  // Normalize movie properties for watchlist objects that use slightly different keys
  const movieId = movie.movie_id || movie.id;
  const displayTitle = movie.title || movie.name;
  const displayYear = movie.release_year || (movie.release_date || movie.first_air_date)?.split('-')[0] || '';
  const voteAverage = movie.vote_average;
  const mediaType = type || movie.media_type || (movie.first_air_date || (movie.name && !movie.title) ? 'tv' : 'movie');

  return (
    <div className={`group cursor-pointer relative ${className}`}>
      <Link href={`/${mediaType}/${movieId}`} className="block h-full">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-xl">
          <img
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          {voteAverage !== undefined && voteAverage > 0 && (
            <div className="absolute top-3 left-3 bg-primary text-surface text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg z-10">
              <span
                className="material-symbols-outlined text-[12px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              {voteAverage.toFixed(1)}
            </div>
          )}
        </div>
        <h4 className="text-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
          {displayTitle}
        </h4>
        <span className="text-xs text-secondary">
          {displayYear}
        </span>
      </Link>
      
      {watchlistIds !== undefined && (
        <div className="absolute bottom-[4.5rem] left-0 right-0 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none pb-3 bg-gradient-to-t from-black/80 to-transparent pt-8 rounded-b-xl">
          <div className="pointer-events-auto">
            <CarouselWatchlistButton 
              movie={{
                id: movieId,
                title: displayTitle,
                poster_path: movie.poster_path,
                release_date: displayYear,
                vote_average: voteAverage,
              }} 
              initialIsAdded={watchlistIds.includes(movieId)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

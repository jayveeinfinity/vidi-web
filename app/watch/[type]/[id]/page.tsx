import VidsrcPlayer from '@/components/VidsrcPlayer';
import WatchOverlay from '@/components/WatchOverlay';
import { getMovieDetails, getTVEpisodeDetails } from '@/lib/tmdb';

interface WatchPageProps {
  params: Promise<{
    type: 'movie' | 'tv';
    id: string;
  }>;
  searchParams: Promise<{
    s?: string;
    e?: string;
  }>;
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { type, id } = await params;
  const { s, e } = await searchParams;

  let title = 'Unknown';
  let year = '';
  let episodeTitle = '';

  const season = s || 1;
  const episode = e || 1;

  const [details, episodeDetails] = await Promise.all([
    getMovieDetails(id, type),
    type === 'tv' ? getTVEpisodeDetails(id, season, episode) : Promise.resolve(null),
  ]);

  if (details) {
    title = type === 'movie' ? details.title : details.name;
    year = (type === 'movie' ? details.release_date : details.first_air_date)?.split('-')[0] || '';
  }

  if (episodeDetails?.name) {
    episodeTitle = episodeDetails.name;
  }

  return (
    <main className="w-full h-screen bg-black overflow-hidden relative">
      <WatchOverlay 
        title={title} 
        year={year} 
        backUrl={`/${type}/${id}`} 
        type={type}
        season={season}
        episode={episode}
        episodeTitle={episodeTitle}
      />
      <div className="w-full h-full">
        <VidsrcPlayer 
          tmdbId={id} 
          type={type} 
          season={season} 
          episode={episode} 
        />
      </div>
    </main>
  );
}
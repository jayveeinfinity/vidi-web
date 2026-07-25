import VidsrcPlayer from '@/components/VidsrcPlayer';
import WatchOverlay from '@/components/WatchOverlay';
import { getMovieDetails } from '@/lib/tmdb';

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

  const details = await getMovieDetails(id, type);
  if (details) {
    title = type === 'movie' ? details.title : details.name;
    year = (type === 'movie' ? details.release_date : details.first_air_date)?.split('-')[0] || '';
  }

  return (
    <main className="w-full h-screen bg-black overflow-hidden relative">
      <WatchOverlay 
        title={title} 
        year={year} 
        backUrl={`/${type}/${id}`} 
      />
      <div className="w-full h-full">
        <VidsrcPlayer 
          tmdbId={id} 
          type={type} 
          season={s || 1} 
          episode={e || 1} 
        />
      </div>
    </main>
  );
}
'use client';

interface VidsrcPlayerProps {
  tmdbId: string | number;
  type: 'movie' | 'tv';
  season?: string | number;
  episode?: string | number;
}

export default function VidsrcPlayer({
  tmdbId,
  type,
  season = 1,
  episode = 1,
}: VidsrcPlayerProps) {
  // Construct the embed URL based on the content type
  const embedUrl =
    type === 'movie'
      ? `https://vidsrc.to/embed/movie/${tmdbId}`
      : `https://vidsrc.to/embed/tv/${tmdbId}?season=${season}&episode=${episode}`;

  return (
    <div className="w-full h-full bg-black relative">
      <iframe
        src={embedUrl}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        referrerPolicy="origin"
        title={`Vidsrc ${type} player`}
      />
    </div>
  );
}

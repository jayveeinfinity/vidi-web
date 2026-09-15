'use server';

export async function searchMovies(query: string) {
  if (!query) return [];

  const res = await fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const results = (data.results || [])
    .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
    .slice(0, 10);

  // Fetch movie & TV genres to map genre_ids to names
  try {
    const [movieGenresRes, tvGenresRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/genre/movie/list?language=en-US`, {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        next: { revalidate: 86400 }
      }),
      fetch(`https://api.themoviedb.org/3/genre/tv/list?language=en-US`, {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        next: { revalidate: 86400 }
      })
    ]);

    const genresMap = new Map();
    if (movieGenresRes.ok) {
      const movieData = await movieGenresRes.json();
      movieData.genres?.forEach((g: any) => genresMap.set(g.id, g.name));
    }
    if (tvGenresRes.ok) {
      const tvData = await tvGenresRes.json();
      tvData.genres?.forEach((g: any) => genresMap.set(g.id, g.name));
    }

    results.forEach((item: any) => {
      if (item.genre_ids) {
        item.genres = item.genre_ids.map((id: number) => genresMap.get(id)).filter(Boolean);
      }
    });
  } catch (err) {
    console.error('Failed to fetch genres in search action:', err);
  }

  return results;
}

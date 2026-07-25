'use server';

export async function searchMovies(query: string) {
  if (!query) return [];

  const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const results = data.results.slice(0, 10);

  // Fetch genres to map genre_ids to names
  const genresRes = await fetch(`https://api.themoviedb.org/3/genre/movie/list?language=en-US`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
    next: { revalidate: 86400 }
  });
  
  if (genresRes.ok) {
    const genresData = await genresRes.json();
    const genresMap = new Map(genresData.genres.map((g: any) => [g.id, g.name]));
    
    results.forEach((movie: any) => {
      if (movie.genre_ids) {
        movie.genres = movie.genre_ids.map((id: number) => genresMap.get(id)).filter(Boolean);
      }
    });
  }

  return results;
}

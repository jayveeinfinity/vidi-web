'use server';

import { getTVSeasonDetails } from '@/lib/tmdb';

export async function fetchSeasonEpisodes(tvId: number | string, seasonNumber: number | string) {
  const season = await getTVSeasonDetails(tvId, seasonNumber);
  return season?.episodes || [];
}

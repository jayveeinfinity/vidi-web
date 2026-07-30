'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkWatchlistStatus(movieId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from('watchlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('movie_id', movieId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

export async function addToWatchlist({
  movieId,
  title,
  posterPath,
  releaseYear,
  genre,
  voteAverage,
}: {
  movieId: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  genre: string;
  voteAverage: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to add to your watchlist.' };
  }

  const { error } = await supabase.from('watchlists').insert({
    user_id: user.id,
    movie_id: movieId,
    title,
    poster_path: posterPath,
    release_year: releaseYear,
    genre,
    vote_average: voteAverage,
  });

  if (error) {
    console.error('Error adding to watchlist:', error);
    return { error: 'Failed to add to watchlist.' };
  }

  revalidatePath('/profile');
  return { success: true };
}

export async function removeFromWatchlist(movieId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to remove from your watchlist.' };
  }

  const { error } = await supabase
    .from('watchlists')
    .delete()
    .eq('user_id', user.id)
    .eq('movie_id', movieId);

  if (error) {
    console.error('Error removing from watchlist:', error);
    return { error: 'Failed to remove from watchlist.' };
  }

  revalidatePath('/profile');
  return { success: true };
}

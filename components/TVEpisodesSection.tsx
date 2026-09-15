'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { fetchSeasonEpisodes } from '@/app/actions/tv';

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date?: string;
  runtime?: number;
  still_path?: string | null;
  vote_average?: number;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path?: string | null;
  air_date?: string;
  overview?: string;
}

interface TVEpisodesSectionProps {
  tvId: number | string;
  tvTitle: string;
  backdropPath?: string | null;
  seasons: Season[];
  initialEpisodes: Episode[];
  initialSeasonNumber: number;
}

export default function TVEpisodesSection({
  tvId,
  backdropPath,
  seasons,
  initialEpisodes,
  initialSeasonNumber,
}: TVEpisodesSectionProps) {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(initialSeasonNumber);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSeasonChange = async (seasonNumber: number) => {
    setIsDropdownOpen(false);
    if (seasonNumber === selectedSeasonNumber || isLoading) return;

    setSelectedSeasonNumber(seasonNumber);
    setIsLoading(true);

    try {
      const newEpisodes = await fetchSeasonEpisodes(tvId, seasonNumber);
      setEpisodes(newEpisodes);
    } catch (err) {
      console.error('Failed to load season episodes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAirDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRuntime = (mins?: number) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  const activeSeason = seasons.find((s) => s.season_number === selectedSeasonNumber) || seasons[0];

  return (
    <section className="max-w-container-max mx-auto px-gutter py-xl border-b border-white/5">
      {/* Section Header with Season Dropdown and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-headline-md font-headline-md text-on-surface">Episodes</h2>
          <p className="text-on-surface-variant font-metadata">
            {activeSeason?.name || `Season ${selectedSeasonNumber}`} • {episodes.length}{' '}
            {episodes.length === 1 ? 'Episode' : 'Episodes'}
          </p>
        </div>

        {/* Controls: Season Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Season Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-white/10 hover:border-primary/40 text-white text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <span>{activeSeason?.name || `Season ${selectedSeasonNumber}`}</span>
              {activeSeason?.episode_count > 0 && (
                <span className="text-xs text-primary/90 font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                  {activeSeason.episode_count} Eps
                </span>
              )}
              <span
                className={`material-symbols-outlined text-[18px] text-white/70 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-primary' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-56 rounded-xl bg-[#141616] border border-white/10 shadow-2xl overflow-hidden py-1.5 z-40 backdrop-blur-xl">
                {seasons.map((season) => {
                  const isSelected = season.season_number === selectedSeasonNumber;
                  return (
                    <button
                      key={season.id}
                      onClick={() => handleSeasonChange(season.season_number)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary/15 text-primary font-semibold'
                          : 'text-on-surface hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{season.name}</span>
                        {season.air_date && (
                          <span className="text-[11px] text-white/40">
                            ({season.air_date.split('-')[0]})
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-primary text-surface font-bold'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {season.episode_count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-surface-container-high border border-white/10 rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-primary text-surface shadow-md shadow-primary/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-primary text-surface shadow-md shadow-primary/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-white/60 text-sm">Loading episodes...</p>
        </div>
      ) : episodes.length > 0 ? (
        viewMode === 'grid' ? (
          /* Grid View (5 per row on laptop/desktop devices) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {episodes.map((episode) => {
              const thumbnail = episode.still_path
                ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                : backdropPath
                ? `https://image.tmdb.org/t/p/w500${backdropPath}`
                : null;

              const runtime = formatRuntime(episode.runtime);
              const airDate = formatAirDate(episode.air_date);

              return (
                <div
                  key={episode.id}
                  className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between group bg-surface-container-high/40 backdrop-blur-md"
                >
                  {/* Thumbnail & Play */}
                  <Link
                    href={`/watch/tv/${tvId}?s=${selectedSeasonNumber}&e=${episode.episode_number}`}
                    className="block relative aspect-video w-full overflow-hidden bg-surface-container-high group/img"
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={episode.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <span className="material-symbols-outlined text-4xl">tv</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover/img:opacity-40 transition-opacity"></div>

                    <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                      <span>EP {episode.episode_number}</span>
                    </div>

                    {runtime && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-medium text-white/80 border border-white/10">
                        {runtime}
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40">
                      <div className="w-10 h-10 rounded-full bg-primary text-surface flex items-center justify-center shadow-lg shadow-primary/30 transform scale-90 group-hover/img:scale-100 transition-transform">
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          play_arrow
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Episode Info */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/watch/tv/${tvId}?s=${selectedSeasonNumber}&e=${episode.episode_number}`}
                        className="text-white font-semibold text-sm line-clamp-1 hover:text-primary transition-colors block mb-1"
                        title={episode.name}
                      >
                        {episode.episode_number}. {episode.name}
                      </Link>

                      <div className="flex items-center gap-2 text-[11px] text-secondary mb-2">
                        {airDate && <span>{airDate}</span>}
                        {episode.vote_average !== undefined && episode.vote_average > 0 && (
                          <span className="flex items-center gap-0.5 text-primary font-medium">
                            <span
                              className="material-symbols-outlined text-[12px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                            {episode.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <p className="text-white/70 text-xs line-clamp-2 leading-relaxed">
                        {episode.overview || 'No synopsis available for this episode.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-white/50">
                        S{selectedSeasonNumber} • E{episode.episode_number}
                      </span>
                      <Link
                        href={`/watch/tv/${tvId}?s=${selectedSeasonNumber}&e=${episode.episode_number}`}
                        className="px-2.5 py-1 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-surface font-semibold text-xs transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span
                          className="material-symbols-outlined text-[14px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          play_arrow
                        </span>
                        Watch
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col gap-4">
            {episodes.map((episode) => {
              const thumbnail = episode.still_path
                ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                : backdropPath
                ? `https://image.tmdb.org/t/p/w500${backdropPath}`
                : null;

              const runtime = formatRuntime(episode.runtime);
              const airDate = formatAirDate(episode.air_date);

              return (
                <div
                  key={episode.id}
                  className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all p-4 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between group bg-surface-container-high/40 backdrop-blur-md"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/watch/tv/${tvId}?s=${selectedSeasonNumber}&e=${episode.episode_number}`}
                    className="relative aspect-video w-full sm:w-56 md:w-64 flex-shrink-0 rounded-xl overflow-hidden bg-surface-container-high group/img"
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={episode.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <span className="material-symbols-outlined text-4xl">tv</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover/img:opacity-40 transition-opacity"></div>

                    <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-white flex items-center gap-1 border border-white/10">
                      <span>EP {episode.episode_number}</span>
                    </div>

                    {runtime && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-medium text-white/80 border border-white/10">
                        {runtime}
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40">
                      <div className="w-10 h-10 rounded-full bg-primary text-surface flex items-center justify-center shadow-lg shadow-primary/30 transform scale-90 group-hover/img:scale-100 transition-transform">
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          play_arrow
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Info Details */}
                  <div className="flex-1 min-w-0 pr-0 sm:pr-4">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <Link
                        href={`/watch/tv/${tvId}?s=${selectedSeasonNumber}&e=${episode.episode_number}`}
                        className="text-white font-semibold text-base hover:text-primary transition-colors truncate"
                        title={episode.name}
                      >
                        {episode.episode_number}. {episode.name}
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-secondary mb-2">
                      {airDate && <span>{airDate}</span>}
                      {runtime && <span>• {runtime}</span>}
                      {episode.vote_average !== undefined && episode.vote_average > 0 && (
                        <span className="flex items-center gap-1 text-primary">
                          <span
                            className="material-symbols-outlined text-[13px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          {episode.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <p className="text-white/70 text-xs sm:text-sm line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {episode.overview || 'No synopsis available for this episode.'}
                    </p>
                  </div>

                  {/* Action CTA */}
                  <div className="w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-center gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span className="text-xs text-white/50 block">
                      S{selectedSeasonNumber} • E{episode.episode_number}
                    </span>
                    <Link
                      href={`/watch/tv/${tvId}?s=${selectedSeasonNumber}&e=${episode.episode_number}`}
                      className="px-4 py-2 rounded-xl bg-primary text-surface font-semibold text-xs transition-all flex items-center gap-1.5 hover:brightness-110 active:scale-95 shadow-md shadow-primary/20"
                    >
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        play_arrow
                      </span>
                      Watch
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="w-full py-16 text-center text-on-surface-variant border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-low/40">
          <span className="material-symbols-outlined text-4xl text-white/30 mb-2">tv_off</span>
          <p className="text-base text-white">No episodes available for this season yet.</p>
        </div>
      )}
    </section>
  );
}

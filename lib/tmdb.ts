import { redis } from './redis';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function getTrending(type: 'movie' | 'tv' = 'movie') {
    const cacheKey = `trending:${type}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (error) {
        console.error('Redis fetch error:', error);
    }

    const res = await fetch(`${TMDB_BASE_URL}/trending/${type}/week`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        next: { revalidate: 86400 } // Cache results for 24 hours in Next.js
    });

    if (!res.ok) {
        throw new Error('Failed to fetch trending content');
    }

    const data = await res.json();
    const results = data.results;

    try {
        await redis.setex(cacheKey, 86400, results);
    } catch (error) {
        console.error('Redis save error:', error);
    }

    return results;
}

export async function getMovieImages(id: number | string, type: 'movie' | 'tv' = 'movie') {
    const cacheKey = `images:${type}:${id}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (error) {
        console.error('Redis fetch error:', error);
    }

    const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}/images?include_image_language=en,null`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        next: { revalidate: 86400 } // Cache results for 24 hours
    });

    if (!res.ok) {
        console.error('Failed to fetch images');
        return { logos: [], backdrops: [], posters: [] };
    }

    const data = await res.json();

    try {
        await redis.setex(cacheKey, 86400, data);
    } catch (error) {
        console.error('Redis save error:', error);
    }

    return data;
}

export async function getMovieDetails(id: number | string, type: 'movie' | 'tv' = 'movie') {
    const cacheKey = `details:${type}:${id}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (error) {
        console.error('Redis fetch error:', error);
    }

    const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}?append_to_response=release_dates,content_ratings,credits,images,reviews,recommendations&include_image_language=en,null`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        next: { revalidate: 86400 } // Cache results for 24 hours
    });

    if (!res.ok) {
        console.error('Failed to fetch details');
        return null;
    }

    const data = await res.json();

    try {
        await redis.setex(cacheKey, 86400, data);
    } catch (error) {
        console.error('Redis save error:', error);
    }

    return data;
}

export async function getTVDetails(id: number | string) {
    return getMovieDetails(id, 'tv');
}

export async function getTVByCategory(category: 'popular' | 'top_rated' | 'on_the_air' | 'airing_today') {
    const cacheKey = `tv:${category}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (error) {
        console.error('Redis fetch error:', error);
    }

    const res = await fetch(`${TMDB_BASE_URL}/tv/${category}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        next: { revalidate: 86400 } // Cache results for 24 hours
    });

    if (!res.ok) {
        console.error(`Failed to fetch ${category} tv shows`);
        return [];
    }

    const data = await res.json();
    const results = data.results;

    try {
        await redis.setex(cacheKey, 86400, results);
    } catch (error) {
        console.error('Redis save error:', error);
    }

    return results;
}

export async function getMoviesByCategory(category: 'popular' | 'top_rated' | 'upcoming') {
    const cacheKey = `movies:${category}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (error) {
        console.error('Redis fetch error:', error);
    }

    const res = await fetch(`${TMDB_BASE_URL}/movie/${category}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        next: { revalidate: 86400 } // Cache results for 24 hours
    });

    if (!res.ok) {
        console.error(`Failed to fetch ${category} movies`);
        return [];
    }

    const data = await res.json();
    const results = data.results;

    try {
        await redis.setex(cacheKey, 86400, results);
    } catch (error) {
        console.error('Redis save error:', error);
    }

    return results;
}

export async function getMoviesByOriginCountry(countryCode: string) {
    const cacheKey = `movies:country:${countryCode}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (error) {
        console.error('Redis fetch error:', error);
    }

    const res = await fetch(`${TMDB_BASE_URL}/discover/movie?with_origin_country=${countryCode}&sort_by=popularity.desc`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        next: { revalidate: 86400 } // Cache results for 24 hours
    });

    if (!res.ok) {
        console.error(`Failed to fetch movies from ${countryCode}`);
        return [];
    }

    const data = await res.json();
    const results = data.results;

    try {
        await redis.setex(cacheKey, 86400, results);
    } catch (error) {
        console.error('Redis save error:', error);
    }

    return results;
}

export async function getMovieListByCategory(category: string, limit: number = 30) {
    let endpoint = '';

    switch (category) {
        case 'new-releases':
            endpoint = '/movie/now_playing';
            break;
        case 'trending':
            endpoint = '/trending/movie/week';
            break;
        case 'popular':
            endpoint = '/movie/popular';
            break;
        case 'top-rated':
            endpoint = '/movie/top_rated';
            break;
        case 'upcoming':
            endpoint = '/movie/upcoming';
            break;
        default:
            endpoint = '/movie/popular'; // fallback
    }

    const cacheKey = `movies_list:${category}:${limit}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (error) {
        console.error('Redis fetch error:', error);
    }

    // Fetch up to 2 pages to get at least 30 results
    let results: any[] = [];

    for (let page = 1; page <= Math.ceil(limit / 20); page++) {
        const res = await fetch(`${TMDB_BASE_URL}${endpoint}?page=${page}`, {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
            next: { revalidate: 86400 }
        });

        if (res.ok) {
            const data = await res.json();
            results = [...results, ...(data.results || [])];
        }
    }

    // Trim to exact limit
    results = results.slice(0, limit);

    try {
        await redis.setex(cacheKey, 86400, results);
    } catch (error) {
        console.error('Redis save error:', error);
    }

    return results;
}

export async function searchMulti(query: string, limit: number = 40) {
    if (!query || !query.trim()) {
        return [];
    }

    const trimmedQuery = query.trim().toLowerCase();
    const cacheKey = `search:multi:${encodeURIComponent(trimmedQuery)}:${limit}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (error) {
        console.error('Redis fetch error:', error);
    }

    let results: any[] = [];
    const maxPages = Math.ceil(limit / 20);

    for (let page = 1; page <= maxPages; page++) {
        const res = await fetch(`${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`, {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
            next: { revalidate: 3600 }
        });

        if (res.ok) {
            const data = await res.json();
            const filtered = (data.results || []).filter(
                (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
            );
            results = [...results, ...filtered];
            if (page >= (data.total_pages || 1)) break;
        }
    }

    results = results.slice(0, limit);

    try {
        await redis.setex(cacheKey, 3600, results);
    } catch (error) {
        console.error('Redis save error:', error);
    }

    return results;
}

export async function getTVEpisodeDetails(id: number | string, season: number | string, episode: number | string) {
    const cacheKey = `tv:episode:${id}:${season}:${episode}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (error) {
        console.error('Redis fetch error:', error);
    }

    const res = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${season}/episode/${episode}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        next: { revalidate: 86400 } // Cache results for 24 hours
    });

    if (!res.ok) {
        return null;
    }

    const data = await res.json();

    try {
        await redis.setex(cacheKey, 86400, data);
    } catch (error) {
        console.error('Redis save error:', error);
    }

    return data;
}

export async function getTVSeasonDetails(id: number | string, seasonNumber: number | string) {
    const cacheKey = `tv:season:${id}:${seasonNumber}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (error) {
        console.error('Redis fetch error:', error);
    }

    const res = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        next: { revalidate: 86400 } // Cache results for 24 hours
    });

    if (!res.ok) {
        return null;
    }

    const data = await res.json();

    try {
        await redis.setex(cacheKey, 86400, data);
    } catch (error) {
        console.error('Redis save error:', error);
    }

    return data;
}


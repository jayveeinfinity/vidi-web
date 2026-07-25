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
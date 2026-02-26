import { CacheManager } from '../utils/cache.js';
import { retryWithBackoff } from '../utils/retry.js';

const cache = new CacheManager();
const CACHE_TTL = 15 * 60 * 1000; // 15 минут

export async function getLocationData(lat, lng) {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (cache.has(key)) {
        return cache.get(key);
    }

    const data = await retryWithBackoff(async () => {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
                headers: {
                    'Accept-Language': 'ru',
                    'User-Agent': 'KartaTochkaInfa/1.0',
                },
            }
        );
        if (!response.ok) {
            throw new Error(`Nominatim HTTP ${response.status}`);
        }
        return response.json();
    });

    const addr = data.address || {};
    const result = {
        address: [addr.road, addr.pedestrian, addr.footway].find(Boolean) || '',
        city: addr.city || addr.town || addr.village || addr.hamlet || '',
        district: addr.city_district || addr.suburb || addr.county || '',
        country: addr.country || '',
        objectName: data.name || data.display_name?.split(',')[0] || '',
        objectType: data.type || data.class || '',
    };

    cache.set(key, result, CACHE_TTL);
    return result;
}

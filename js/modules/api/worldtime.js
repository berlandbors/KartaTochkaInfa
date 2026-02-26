import { retryWithBackoff } from '../utils/retry.js';

export async function getTimezoneData(lat, lng) {
    // WorldTimeAPI does not provide a coordinate-to-timezone lookup endpoint.
    // We use the browser's Intl API to determine the local timezone, then
    // query WorldTimeAPI for that timezone. Falls back to local time if unavailable.
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/GMT';
    try {
        const data = await retryWithBackoff(async () => {
            const response = await fetch(
                `https://worldtimeapi.org/api/timezone/${encodeURIComponent(localZone)}`
            );
            if (!response.ok) {
                throw new Error(`WorldTimeAPI HTTP ${response.status}`);
            }
            return response.json();
        });

        return {
            timezone: data.timezone || localZone,
            utcOffset: data.utc_offset || getLocalUtcOffset(),
            currentTime: data.datetime
                ? new Date(data.datetime).toLocaleTimeString('ru-RU')
                : new Date().toLocaleTimeString('ru-RU'),
        };
    } catch (error) {
        console.warn('WorldTimeAPI недоступен, используем локальное время:', error.message);
        return {
            timezone: localZone,
            utcOffset: getLocalUtcOffset(),
            currentTime: new Date().toLocaleTimeString('ru-RU'),
        };
    }
}

function getLocalUtcOffset() {
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
    return `${sign}${hours}:${minutes}`;
}

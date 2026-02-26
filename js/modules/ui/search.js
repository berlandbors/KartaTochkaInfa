import { escapeHtml } from '../utils/helpers.js';

let searchTimeout = null;

export function initSearch(scanLocationFn) {
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');

    if (!input || !results) return;

    input.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = input.value.trim();
        if (query.length < 3) {
            results.innerHTML = '';
            results.style.display = 'none';
            return;
        }
        searchTimeout = setTimeout(() => performSearch(query, results, scanLocationFn), 500);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            results.style.display = 'none';
        }
    });
}

async function performSearch(query, results, scanLocationFn) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=ru`,
            { headers: { 'User-Agent': 'KartaTochkaInfa/1.0' } }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        if (!data.length) {
            results.innerHTML = '<div class="search-result-item">Ничего не найдено</div>';
            results.style.display = 'block';
            return;
        }

        results.innerHTML = data.map(item => `
            <div class="search-result-item" data-lat="${item.lat}" data-lng="${item.lon}">
                ${escapeHtml(item.display_name)}
            </div>
        `).join('');
        results.style.display = 'block';

        results.querySelectorAll('.search-result-item[data-lat]').forEach(el => {
            el.addEventListener('click', () => {
                const lat = parseFloat(el.dataset.lat);
                const lng = parseFloat(el.dataset.lng);
                results.style.display = 'none';
                document.getElementById('searchInput').value = '';
                scanLocationFn(lat, lng);
            });
        });
    } catch (error) {
        console.error('Ошибка поиска:', error);
        results.innerHTML = '<div class="search-result-item">Ошибка поиска</div>';
        results.style.display = 'block';
    }
}

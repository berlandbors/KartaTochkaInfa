import * as state from '../../state.js';
import { escapeHtml } from '../utils/helpers.js';

export function initMap(scanLocationFn) {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    state.setMap(L.map('map').setView([55.7558, 37.6173], 10));

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(state.map);

    state.map.on('click', (e) => {
        scanLocationFn(e.latlng.lat, e.latlng.lng);
    });
}

export function createMarker(lat, lng, data) {
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin">${state.markerCount}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -32],
    });

    const marker = L.marker([lat, lng], { icon }).addTo(state.map);

    const popupHtml = `
        <div class="popup-content">
            <div class="popup-coords">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
            ${data.city ? `<br>📍 ${escapeHtml(data.city)}` : ''}
            ${data.objectName ? `<br>🏢 ${escapeHtml(data.objectName)}` : ''}
            <button class="popup-details-btn" onclick="window._showDetails && window._showDetails('${escapeHtml(data.id)}')">
                ℹ Подробнее
            </button>
        </div>
    `;
    marker.bindPopup(popupHtml);
    state.addMarker(marker);
    return marker;
}

export function clearMarkers() {
    state.markers.forEach(m => m.remove());
    state.clearMarkers();
}

export function getCurrentLocation(scanLocationFn) {
    if (!navigator.geolocation) {
        alert('Геолокация не поддерживается вашим браузером');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => scanLocationFn(pos.coords.latitude, pos.coords.longitude),
        (err) => {
            console.error('Геолокация недоступна:', err.message);
            alert('Не удалось получить геопозицию: ' + err.message);
        },
        { timeout: 10000 }
    );
}

export function updateTimestamp() {
    const el = document.getElementById('timestamp');
    if (el) {
        el.textContent = `ОБНОВЛЕНО: ${new Date().toLocaleString('ru-RU')}`;
    }
}

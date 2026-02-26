import { escapeHtml } from '../utils/helpers.js';
import { displayFullInfo } from './modal.js';

export function createPopupContent(data) {
    const city = data.city ? `<br>📍 ${escapeHtml(data.city)}` : '';
    const name = data.objectName ? `<br>🏢 ${escapeHtml(data.objectName)}` : '';

    return `
        <div class="popup-content">
            <div class="popup-coords">
                ${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}
            </div>
            ${city}${name}
            <button class="popup-details-btn" onclick="window._showDetails && window._showDetails(${data.id})">
                ℹ Подробнее
            </button>
        </div>
    `;
}

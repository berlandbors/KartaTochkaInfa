import { escapeHtml } from '../utils/helpers.js';
import { formatCoordinates, getObjectTypeName } from '../utils/formatters.js';

export function displayFullInfo(data) {
    const overlay = document.getElementById('modalOverlay');
    const body = document.getElementById('modalBody');
    const subtitle = document.getElementById('modalSubtitle');

    if (!overlay || !body) return;

    const coords = formatCoordinates(data.lat, data.lng);
    subtitle.textContent = `${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`;

    body.innerHTML = `
        <div class="modal-section">
            <div class="modal-section-title">&gt;&gt;&gt; КООРДИНАТЫ &lt;&lt;&lt;</div>
            <div class="modal-row"><span class="modal-label">Широта:</span><span class="modal-value">${escapeHtml(coords.lat)}</span></div>
            <div class="modal-row"><span class="modal-label">Долгота:</span><span class="modal-value">${escapeHtml(coords.lng)}</span></div>
        </div>
        <div class="modal-section">
            <div class="modal-section-title">&gt;&gt;&gt; АДРЕС &lt;&lt;&lt;</div>
            <div class="modal-row"><span class="modal-label">Улица:</span><span class="modal-value">${escapeHtml(data.address || '—')}</span></div>
            <div class="modal-row"><span class="modal-label">Город:</span><span class="modal-value">${escapeHtml(data.city || '—')}</span></div>
            <div class="modal-row"><span class="modal-label">Район:</span><span class="modal-value">${escapeHtml(data.district || '—')}</span></div>
            <div class="modal-row"><span class="modal-label">Страна:</span><span class="modal-value">${escapeHtml(data.country || '—')}</span></div>
        </div>
        <div class="modal-section">
            <div class="modal-section-title">&gt;&gt;&gt; ОБЪЕКТ &lt;&lt;&lt;</div>
            <div class="modal-row"><span class="modal-label">Тип:</span><span class="modal-value">${escapeHtml(getObjectTypeName(data.objectType))}</span></div>
            <div class="modal-row"><span class="modal-label">Название:</span><span class="modal-value">${escapeHtml(data.objectName || '—')}</span></div>
        </div>
        <div class="modal-section">
            <div class="modal-section-title">&gt;&gt;&gt; ЧАСОВОЙ ПОЯС &lt;&lt;&lt;</div>
            <div class="modal-row"><span class="modal-label">Зона:</span><span class="modal-value">${escapeHtml(data.timezone || '—')}</span></div>
            <div class="modal-row"><span class="modal-label">UTC:</span><span class="modal-value">${escapeHtml(data.utcOffset || '—')}</span></div>
            <div class="modal-row"><span class="modal-label">Время:</span><span class="modal-value">${escapeHtml(data.currentTime || '—')}</span></div>
        </div>
    `;

    overlay.classList.add('active');
}

export function closeModal(event) {
    if (event && event.target !== document.getElementById('modalOverlay')) return;
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('active');
}

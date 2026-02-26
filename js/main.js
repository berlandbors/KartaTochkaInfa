import * as state from './state.js';
import { initMap, createMarker, clearMarkers as mapClearMarkers, getCurrentLocation as mapGetCurrentLocation, updateTimestamp } from './modules/ui/map.js';
import { showLoading, hideLoading, showError } from './modules/ui/loading.js';
import { displayFullInfo, closeModal as uiCloseModal } from './modules/ui/modal.js';
import { initSearch } from './modules/ui/search.js';
import { shareLocation as uiShareLocation, closeShareModal as uiCloseShareModal, copyShareLink as uiCopyShareLink, decodeLocationData } from './modules/ui/share.js';
import { getLocationData } from './modules/api/nominatim.js';
import { getTimezoneData } from './modules/api/worldtime.js';
import { escapeHtml, generateId } from './modules/utils/helpers.js';
import { formatCoordinates, getObjectTypeName } from './modules/utils/formatters.js';

// Хранилище данных маркеров по id
const markerDataStore = {};

async function scanLocation(lat, lng) {
    showLoading('СКАНИРОВАНИЕ...');
    state.incrementMarkerCount();

    try {
        const [locationData, timezoneData] = await Promise.all([
            getLocationData(lat, lng),
            getTimezoneData(lat, lng),
        ]);

        const id = generateId();
        const data = {
            id,
            lat,
            lng,
            ...locationData,
            ...timezoneData,
        };

        markerDataStore[id] = data;
        state.setLastScannedCoords({ lat, lng });
        state.setCurrentMarkerData(data);

        createMarker(lat, lng, data);
        displayInfoPanel(data);
        updateTimestamp();

        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) shareBtn.disabled = false;
    } catch (error) {
        console.error('Ошибка сканирования:', error);
        showError(`Не удалось получить данные: ${escapeHtml(error.message)}`);
    } finally {
        hideLoading();
    }
}

function displayInfoPanel(data) {
    const content = document.getElementById('infoContent');
    if (!content) return;

    const coords = formatCoordinates(data.lat, data.lng);

    content.innerHTML = `
        <div class="info-section">
            <div class="section-title">&gt;&gt;&gt; КООРДИНАТЫ &lt;&lt;&lt;</div>
            <div class="info-row"><span class="info-label">Широта:</span><span class="info-value">${escapeHtml(coords.lat)}</span></div>
            <div class="info-row"><span class="info-label">Долгота:</span><span class="info-value">${escapeHtml(coords.lng)}</span></div>
        </div>
        <div class="info-section">
            <div class="section-title">&gt;&gt;&gt; АДРЕС &lt;&lt;&lt;</div>
            <div class="info-row"><span class="info-label">Улица:</span><span class="info-value">${escapeHtml(data.address || '—')}</span></div>
            <div class="info-row"><span class="info-label">Город:</span><span class="info-value">${escapeHtml(data.city || '—')}</span></div>
            <div class="info-row"><span class="info-label">Район:</span><span class="info-value">${escapeHtml(data.district || '—')}</span></div>
            <div class="info-row"><span class="info-label">Страна:</span><span class="info-value">${escapeHtml(data.country || '—')}</span></div>
        </div>
        <div class="info-section">
            <div class="section-title">&gt;&gt;&gt; ОБЪЕКТ &lt;&lt;&lt;</div>
            <div class="info-row"><span class="info-label">Тип:</span><span class="info-value">${escapeHtml(getObjectTypeName(data.objectType))}</span></div>
            <div class="info-row"><span class="info-label">Название:</span><span class="info-value">${escapeHtml(data.objectName || '—')}</span></div>
        </div>
        <div class="info-section">
            <div class="section-title">&gt;&gt;&gt; ЧАСОВОЙ ПОЯС &lt;&lt;&lt;</div>
            <div class="info-row"><span class="info-label">Зона:</span><span class="info-value">${escapeHtml(data.timezone || '—')}</span></div>
            <div class="info-row"><span class="info-label">UTC:</span><span class="info-value">${escapeHtml(data.utcOffset || '—')}</span></div>
            <div class="info-row"><span class="info-label">Время:</span><span class="info-value">${escapeHtml(data.currentTime || '—')}</span></div>
        </div>
        <div class="info-section">
            <button class="control-btn" onclick="window._openFullInfo()">[ 📋 ДЕТАЛЬНАЯ ИНФОРМАЦИЯ ]</button>
        </div>
    `;
}

// Глобальные функции для HTML onclick
window._showDetails = (id) => {
    const data = markerDataStore[id];
    if (data) displayFullInfo(data);
};

window._openFullInfo = () => {
    if (state.currentMarkerData) displayFullInfo(state.currentMarkerData);
};

window.getCurrentLocation = () => mapGetCurrentLocation(scanLocation);
window.shareLocation = () => uiShareLocation();
window.clearMarkers = () => {
    mapClearMarkers();
    const content = document.getElementById('infoContent');
    if (content) {
        content.innerHTML = `<div class="no-selection">▼ КЛИКНИТЕ НА КАРТУ ▼<br><br>[ ОЖИДАНИЕ КООРДИНАТ... ]<br><br>Система готова к сканированию<br>любой точки на карте</div>`;
    }
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) shareBtn.disabled = true;
    state.setLastScannedCoords(null);
    state.setCurrentMarkerData(null);
};
window.closeModal = (event) => {
    if (event && event.target !== document.getElementById('modalOverlay')) return;
    uiCloseModal(event);
};
window.closeShareModal = (event) => {
    if (event && event.target !== document.getElementById('shareModal')) return;
    uiCloseShareModal(event);
};
window.copyShareLink = () => uiCopyShareLink();

// Мобильный переключатель
function initMobileTabs() {
    const switcher = document.getElementById('mobileTabSwitcher');
    const mapContainer = document.querySelector('.map-container');
    const infoPanel = document.getElementById('info-panel');

    if (!switcher) return;

    if (state.isMobile) {
        switcher.style.display = 'flex';
    }

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.dataset.tab;
            if (mapContainer) mapContainer.style.display = tab === 'map' ? 'block' : 'none';
            if (infoPanel) infoPanel.style.display = tab === 'info' ? 'flex' : 'none';
        });
    });
}

// Уведомление для мобильных
function initMobileNotification() {
    const notification = document.getElementById('mobileNotification');
    if (!notification || !state.isMobile) return;

    if (localStorage.getItem('hideMobileNotification') === 'true') return;

    notification.style.display = 'flex';

    document.getElementById('closeNotification')?.addEventListener('click', () => {
        if (document.getElementById('dontShowAgain')?.checked) {
            localStorage.setItem('hideMobileNotification', 'true');
        }
        notification.style.display = 'none';
    });
}

// Загрузка по share параметру
async function handleShareParam() {
    const params = new URLSearchParams(location.search);
    const encoded = params.get('share');
    if (!encoded) return;

    const data = decodeLocationData(encoded);
    if (!data || typeof data.lat !== 'number' || typeof data.lng !== 'number') return;

    await scanLocation(data.lat, data.lng);
    if (state.map) {
        state.map.setView([data.lat, data.lng], 14);
    }
}

// Инициализация загрузчика в HTML (динамически добавляем элемент)
function addLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'loadingIndicator';
    indicator.className = 'loading-indicator';
    indicator.style.display = 'none';
    document.body.appendChild(indicator);
}

// Старт
addLoadingIndicator();
initMap(scanLocation);
initMobileTabs();
initMobileNotification();
initSearch(scanLocation);
handleShareParam();

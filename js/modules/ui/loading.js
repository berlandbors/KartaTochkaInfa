let loadingEl = null;

function ensureElement() {
    if (!loadingEl) {
        loadingEl = document.getElementById('loadingIndicator');
    }
    return loadingEl;
}

export function showLoading(message = 'СКАНИРОВАНИЕ...') {
    const el = ensureElement();
    if (el) {
        el.textContent = `⟳ ${message}`;
        el.style.display = 'block';
    }
}

export function hideLoading() {
    const el = ensureElement();
    if (el) {
        el.style.display = 'none';
    }
}

export function showError(message) {
    const content = document.getElementById('infoContent');
    if (content) {
        content.innerHTML = `<div class="error-message">⚠ ОШИБКА<br><br>${message}</div>`;
    }
}

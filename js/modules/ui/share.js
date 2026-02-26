import * as state from '../../state.js';
import { escapeHtml } from '../utils/helpers.js';

export function shareLocation() {
    if (!state.lastScannedCoords || !state.currentMarkerData) return;

    const { lat, lng } = state.lastScannedCoords;
    const encoded = encodeLocationData(lat, lng, state.currentMarkerData);
    const shareUrl = `${location.origin}${location.pathname}?share=${encoded}`;

    const coordsEl = document.getElementById('shareCoords');
    const linkInput = document.getElementById('shareLinkInput');

    if (coordsEl) coordsEl.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    if (linkInput) linkInput.value = shareUrl;

    generateQRCode(shareUrl);

    const modal = document.getElementById('shareModal');
    if (modal) modal.classList.add('active');
}

export function encodeLocationData(lat, lng, data) {
    const payload = { lat, lng, ...data };
    return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function decodeLocationData(encoded) {
    try {
        return JSON.parse(decodeURIComponent(atob(encoded)));
    } catch {
        return null;
    }
}

export function generateQRCode(url) {
    const container = document.getElementById('shareQR');
    if (!container) return;
    container.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
        new QRCode(container, {
            text: url,
            width: 160,
            height: 160,
            colorDark: '#00ff41',
            colorLight: '#000000',
        });
    }
}

export async function copyShareLink() {
    const input = document.getElementById('shareLinkInput');
    const btn = document.getElementById('copyBtnText');
    if (!input) return;

    try {
        await navigator.clipboard.writeText(input.value);
        if (btn) {
            btn.textContent = '✓ СКОПИРОВАНО';
            setTimeout(() => { btn.textContent = '📋 КОПИРОВАТЬ'; }, 2000);
        }
    } catch {
        input.select();
        document.execCommand('copy');
        if (btn) {
            btn.textContent = '✓ СКОПИРОВАНО';
            setTimeout(() => { btn.textContent = '📋 КОПИРОВАТЬ'; }, 2000);
        }
    }
}

export function closeShareModal(event) {
    if (event && event.target !== document.getElementById('shareModal')) return;
    const modal = document.getElementById('shareModal');
    if (modal) modal.classList.remove('active');
}

export let map = null;
export let markers = [];
export let lastScannedCoords = null;
export let currentMarkerData = null;
export let markerCount = 0;
export const isMobile = window.innerWidth <= 768;

export function setMap(m) { map = m; }
export function addMarker(m) { markers.push(m); }
export function clearMarkers() { markers = []; markerCount = 0; }
export function setLastScannedCoords(coords) { lastScannedCoords = coords; }
export function setCurrentMarkerData(data) { currentMarkerData = data; }
export function incrementMarkerCount() { markerCount++; return markerCount; }

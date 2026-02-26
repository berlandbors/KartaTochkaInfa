export function formatCoordinates(lat, lng) {
    return {
        lat: `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'С.Ш.' : 'Ю.Ш.'}`,
        lng: `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'В.Д.' : 'З.Д.'}`,
    };
}

export function getObjectTypeName(type) {
    const types = {
        amenity: 'Объект инфраструктуры',
        building: 'Здание',
        highway: 'Дорога',
        railway: 'Железная дорога',
        waterway: 'Водный объект',
        natural: 'Природный объект',
        place: 'Место',
        tourism: 'Туристический объект',
        shop: 'Магазин',
        office: 'Офис',
        leisure: 'Зона отдыха',
        historic: 'Исторический объект',
        landuse: 'Землепользование',
        boundary: 'Административный объект',
        sport: 'Спортивный объект',
        man_made: 'Рукотворный объект',
        aeroway: 'Аэропорт/аэродром',
        military: 'Военный объект',
    };
    return types[type] || type || 'Неизвестно';
}

export function parseWKTPoint(wkt) {
    const match = wkt?.match(/POINT\s*\(([^)]+)\)/);
    if (!match) return null;
    return match[1].trim().split(' ').map(Number);
}

export function parseWKTPolygon(wkt) {
    const clean = wkt.replace(/^SRID=\d+;/, '');
    const match = clean.match(/\(\(([^)]+)\)\)/);
    if (!match) return null;

    return match[1].split(',').map(pair => {
        const [lng, lat] = pair.trim().split(' ').map(Number);
        return [lng, lat];
    });
}

export function getPolygonCentroid(coords) {
    if (!coords || coords.length === 0) return null;

    let x = 0, y = 0;
    coords.forEach(([lng, lat]) => {
        x += lng;
        y += lat;
    });

    return [x / coords.length, y / coords.length];
}

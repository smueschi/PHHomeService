
// Haversine formula to calculate distance (in km) between two points
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Number(d.toFixed(1)); // Return 1 decimal place
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Mock center of General Luna, Siargao
export const DEFAULT_CENTER = {
    lat: 9.7892,
    lng: 126.1554
};

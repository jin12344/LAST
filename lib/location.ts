import type { Photo, Location } from '@/types';

const GROUP_RADIUS_METERS = 50;
const NO_LOCATION_ID = 'no-location';
const NO_LOCATION_NAME = '위치정보 없음';

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // 지구 반지름 (m)
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

interface PhotoGroup {
  photos: Photo[];
  lat: number;
  lng: number;
}

export function groupPhotos(photos: Photo[]): Location[] {
  const withGPS = photos.filter((p) => !isNaN(p.lat) && !isNaN(p.lng));
  const withoutGPS = photos.filter((p) => isNaN(p.lat) || isNaN(p.lng));

  const groups: PhotoGroup[] = [];

  for (const photo of withGPS) {
    let matched = false;

    for (const group of groups) {
      const distance = haversineDistance(group.lat, group.lng, photo.lat, photo.lng);

      if (distance <= GROUP_RADIUS_METERS) {
        group.photos.push(photo);

        const total = group.photos.length;
        group.lat =
          group.photos.reduce((sum, p) => sum + p.lat, 0) / total;
        group.lng =
          group.photos.reduce((sum, p) => sum + p.lng, 0) / total;

        matched = true;
        break;
      }
    }

    if (!matched) {
      groups.push({ photos: [photo], lat: photo.lat, lng: photo.lng });
    }
  }

  const locations: Location[] = groups.map((group) => ({
    id: crypto.randomUUID(),
    name: `위치 ${group.lat.toFixed(4)}, ${group.lng.toFixed(4)}`,
    lat: group.lat,
    lng: group.lng,
    photos: group.photos,
  }));

  if (withoutGPS.length > 0) {
    locations.push({
      id: NO_LOCATION_ID,
      name: NO_LOCATION_NAME,
      lat: 0,
      lng: 0,
      photos: withoutGPS,
    });
  }

  return locations;
}

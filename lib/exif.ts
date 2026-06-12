import type { GPSCoordinates } from '@/types';

declare global {
  interface Window {
    piexif: any;
  }
}

const PIEXIF_CDN_URL = 'https://cdn.jsdelivr.net/npm/piexifjs@1.0.6/piexif.js';

let piexifLoadPromise: Promise<void> | null = null;

function loadPiexif(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('EXIF 처리는 브라우저에서만 가능합니다.'));
  }

  if (window.piexif) {
    return Promise.resolve();
  }

  if (piexifLoadPromise) {
    return piexifLoadPromise;
  }

  piexifLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PIEXIF_CDN_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('piexifjs 로드 실패')));
      return;
    }

    const script = document.createElement('script');
    script.src = PIEXIF_CDN_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('piexifjs 로드 실패'));
    document.head.appendChild(script);
  });

  return piexifLoadPromise;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function convertDMSToDecimal(dms: number[][], ref: string): number {
  const degrees = dms[0][0] / dms[0][1];
  const minutes = dms[1][0] / dms[1][1];
  const seconds = dms[2][0] / dms[2][1];

  let decimal = degrees + minutes / 60 + seconds / 3600;

  if (ref === 'S' || ref === 'W') {
    decimal = -decimal;
  }

  return decimal;
}

export async function extractGPS(file: File): Promise<GPSCoordinates | null> {
  try {
    await loadPiexif();

    const dataUrl = await readFileAsDataURL(file);
    const exifData = window.piexif.load(dataUrl);
    const gps = exifData['GPS'];

    if (
      !gps ||
      !gps[window.piexif.GPSIFD.GPSLatitude] ||
      !gps[window.piexif.GPSIFD.GPSLongitude]
    ) {
      return null;
    }

    const latRef = gps[window.piexif.GPSIFD.GPSLatitudeRef];
    const lngRef = gps[window.piexif.GPSIFD.GPSLongitudeRef];
    const latDMS = gps[window.piexif.GPSIFD.GPSLatitude];
    const lngDMS = gps[window.piexif.GPSIFD.GPSLongitude];

    const lat = convertDMSToDecimal(latDMS, latRef);
    const lng = convertDMSToDecimal(lngDMS, lngRef);

    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }

    return { lat, lng };
  } catch (error) {
    console.error('extractGPS error:', error);
    return null;
  }
}

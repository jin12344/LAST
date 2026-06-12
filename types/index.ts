export interface User {
  uid: string;
  email: string;
}

export interface Photo {
  id: string;
  filename: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  photos: Photo[];
}

export interface Project {
  id: string;
  projectName: string;
  createdAt: string;
  locations: Record<string, Location>;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface GPSCoordinates {
  lat: number;
  lng: number;
}

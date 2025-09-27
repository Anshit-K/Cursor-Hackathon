export interface Pin {
  id: string;
  lat: number;
  lng: number;
  story: string;
  placeName: string;
  imagePath?: string;
  timestamp: string;
}

export interface CreatePinRequest {
  lat: number;
  lng: number;
  story: string;
  placeName: string;
  imagePath?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}


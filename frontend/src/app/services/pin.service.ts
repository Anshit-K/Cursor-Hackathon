import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Pin, CreatePinRequest, ApiResponse } from '../models/pin.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PinService {
  private readonly storageKey = 'memory-lane-demo-pins';
  private readonly apiUrl = environment.apiBaseUrl ? `${environment.apiBaseUrl}/api` : '';

  constructor(private http: HttpClient) {}

  private getDemoPins(): Pin[] {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return JSON.parse(stored) as Pin[];
      } catch {
        localStorage.removeItem(this.storageKey);
      }
    }

    const defaultPins: Pin[] = [
      {
        id: 'demo-nyc',
        lat: 40.7128,
        lng: -74.006,
        story: 'Exploring the city with friends and watching the skyline light up at night.',
        placeName: 'New York City',
        timestamp: '2025-01-15T18:30:00.000Z'
      },
      {
        id: 'demo-paris',
        lat: 48.8566,
        lng: 2.3522,
        story: 'A slow evening walk along the Seine and the best pastries in Paris.',
        placeName: 'Paris',
        timestamp: '2025-02-12T09:15:00.000Z'
      },
      {
        id: 'demo-tokyo',
        lat: 35.6762,
        lng: 139.6503,
        story: 'Late-night ramen and neon lights made the whole city feel cinematic.',
        placeName: 'Tokyo',
        timestamp: '2025-03-21T20:05:00.000Z'
      }
    ];

    localStorage.setItem(this.storageKey, JSON.stringify(defaultPins));
    return defaultPins;
  }

  private saveDemoPins(pins: Pin[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(pins));
  }

  private createDemoPin(pinData: CreatePinRequest): Pin {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return {
      ...pinData,
      id,
      timestamp: new Date().toISOString()
    };
  }

  createPin(pinData: CreatePinRequest): Observable<ApiResponse<Pin>> {
    console.log('Sending pin data:', pinData);

    if (!this.apiUrl) {
      const newPin = this.createDemoPin(pinData);
      const pins = this.getDemoPins();
      const updatedPins = [newPin, ...pins];
      this.saveDemoPins(updatedPins);
      return of({ success: true, data: newPin });
    }

    return this.http.post<ApiResponse<Pin>>(`${this.apiUrl}/pins`, pinData).pipe(
      catchError(() => {
        const newPin = this.createDemoPin(pinData);
        const pins = this.getDemoPins();
        const updatedPins = [newPin, ...pins];
        this.saveDemoPins(updatedPins);
        return of({ success: true, data: newPin });
      })
    );
  }

  getAllPins(): Observable<ApiResponse<Pin[]>> {
    if (!this.apiUrl) {
      return of({ success: true, data: this.getDemoPins() });
    }

    return this.http.get<ApiResponse<Pin[]>>(`${this.apiUrl}/pins`).pipe(
      catchError(() => of({ success: true, data: this.getDemoPins() }))
    );
  }

}


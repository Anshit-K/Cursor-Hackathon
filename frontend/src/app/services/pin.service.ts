import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pin, CreatePinRequest, ApiResponse } from '../models/pin.model';

@Injectable({
  providedIn: 'root'
})
export class PinService {
  private readonly apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  createPin(pinData: CreatePinRequest): Observable<ApiResponse<Pin>> {
    console.log('Sending pin data:', pinData);
    return this.http.post<ApiResponse<Pin>>(`${this.apiUrl}/pins`, pinData);
  }

  getAllPins(): Observable<ApiResponse<Pin[]>> {
    return this.http.get<ApiResponse<Pin[]>>(`${this.apiUrl}/pins`);
  }

}


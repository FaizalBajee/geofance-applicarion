import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private apiKey = 'AIzaSyDsDrY1Tf0e5Pdf7R_VwHCPt3a29ue5FFU';

  constructor(private http: HttpClient) { }

  reverseGeocode(lat: number, lng: number): Observable<any> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
    return this.http.get(url);
  }
};

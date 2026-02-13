import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Trip } from '../core/models/trip.model';
import { TRIPS } from '../core/data/trips.mock';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  getTrips(): Observable<Trip[]> {
    return of(TRIPS);
  }

  getTripById(id: string): Observable<Trip | undefined> {
    const trip = TRIPS.find((temp) => temp.id === id);
    return of(trip);
  }
}

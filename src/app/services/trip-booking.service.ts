import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface TripBookingRequest {
  reference: string;
  tripId: string;
  fullName: string;
  email: string;
  phone: string;
  people: number;
  preferredDate: string;
  preferredTime?: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  notes?: string;
  agreed: boolean;
  submittedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripBookingService {
  private cacheKey = 'tripBookings';
  private bookings: TripBookingRequest[] = [];

  constructor() {
    const saved = localStorage.getItem(this.cacheKey);
    if (saved) {
      try {
        this.bookings = JSON.parse(saved);
      } catch {
        this.bookings = [];
      }
    }
  }

  requestBooking(payload: Omit<TripBookingRequest, 'reference' | 'submittedAt'>): Observable<TripBookingRequest> {
    const timestamp = Date.now();
    const reference = `TRIP-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random()*9000)+1000}`;
    const booking: TripBookingRequest = {
      ...payload,
      reference,
      submittedAt: new Date(timestamp).toISOString(),
    };
    this.bookings.push(booking);
    localStorage.setItem(this.cacheKey, JSON.stringify(this.bookings));
    return of(booking);
  }
}

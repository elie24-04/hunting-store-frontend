import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export type TripBookingStatus = 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'CANCELLED';

export interface TripBookingRequest {
  tripId: string;
  tripTitle: string;
  tripLocation: string;
  fullName: string;
  email: string;
  phone: string;
  people: number;
  preferredDate: string;
  preferredTime?: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  notes?: string;
  agreed: boolean;
  status: TripBookingStatus;
}

export interface TripBookingResponse extends TripBookingRequest {
  id?: string | number;
  reference?: string;
  referenceCode?: string;
  bookingId?: string;
  message?: string;
  submittedAt: string;
}

interface BackendTripBookingRequest {
  customerName: string;
  email: string;
  phone: string;
  travelers: number;
  departureDate: string;
  experienceLevel: string;
  notes?: string;
}

interface BackendTripBookingResponse {
  bookingId: string;
  referenceCode: string;
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripBookingService {
  constructor(private readonly http: HttpClient) {}

  requestBooking(payload: TripBookingRequest): Observable<TripBookingResponse> {
    const requestBody: BackendTripBookingRequest = {
      customerName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      travelers: payload.people,
      departureDate: payload.preferredDate,
      experienceLevel: payload.experience,
      notes: payload.notes
    };

    const endpoint = `${environment.apiBaseUrl}/trips/${payload.tripId}/bookings`;

    return this.http.post<BackendTripBookingResponse>(endpoint, requestBody).pipe(
      map((response) => ({
        ...payload,
        id: response.bookingId,
        bookingId: response.bookingId,
        reference: response.referenceCode,
        referenceCode: response.referenceCode,
        status: response.status as TripBookingStatus,
        message: response.message,
        submittedAt: new Date().toISOString()
      }))
    );
  }
}

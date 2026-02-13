import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Trip } from 'src/app/core/models/trip.model';
import { TripService } from 'src/app/services/trip.service';
import { TripBookingService, TripBookingRequest } from 'src/app/services/trip-booking.service';

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.css']
})
export class TripDetailsComponent implements OnInit {
  trip?: Trip;
  isLoading = true;
  bookingForm: FormGroup;
  successBooking?: TripBookingRequest;

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private tripBookingService: TripBookingService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.bookingForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      people: [1, [Validators.required, Validators.min(1)]],
      preferredDate: ['', Validators.required],
      preferredTime: [''],
      experience: ['Beginner', Validators.required],
      notes: [''],
      agreed: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('id');
    if (!tripId) {
      this.router.navigate(['/trips']);
      return;
    }

    this.tripService.getTripById(tripId).subscribe((trip) => {
      if (!trip) {
        this.router.navigate(['/trips']);
        return;
      }
      this.trip = trip;
      this.isLoading = false;
      if (trip.availableDates.length) {
        this.bookingForm.patchValue({ preferredDate: trip.availableDates[0] });
      }
    });
  }

  submitBooking(): void {
    if (!this.trip || this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const payload = {
      tripId: this.trip.id,
      fullName: this.bookingForm.value.fullName,
      email: this.bookingForm.value.email,
      phone: this.bookingForm.value.phone,
      people: this.bookingForm.value.people,
      preferredDate: this.bookingForm.value.preferredDate,
      preferredTime: this.bookingForm.value.preferredTime,
      experience: this.bookingForm.value.experience,
      notes: this.bookingForm.value.notes,
      agreed: this.bookingForm.value.agreed,
    };

    this.tripBookingService.requestBooking(payload).subscribe((booking) => {
      this.successBooking = booking;
      this.bookingForm.reset({
        fullName: '',
        email: '',
        phone: '',
        people: 1,
        preferredDate: this.trip?.availableDates[0] ?? '',
        preferredTime: '',
        experience: 'Beginner',
        notes: '',
        agreed: false,
      });
    });
  }
}

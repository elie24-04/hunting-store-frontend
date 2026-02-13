import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { MessagesService } from '../../../services/messages.service';
import {
  CreateMessageRequest,
  MESSAGE_TYPE_OPTIONS
} from '../message.types';

@Component({
  selector: 'app-message-page',
  templateUrl: './message-page.component.html',
  styleUrls: ['./message-page.component.css']
})
export class MessagePageComponent {
  readonly messageTypeOptions = MESSAGE_TYPE_OPTIONS;
  readonly defaultType = MESSAGE_TYPE_OPTIONS[0].value;

  isSubmitting = false;

  readonly messageForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    type: [this.defaultType, Validators.required],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly messagesService: MessagesService,
    private readonly toastr: ToastrService
  ) {}

  get nameControl() {
    return this.messageForm.get('name')!;
  }

  get emailControl() {
    return this.messageForm.get('email')!;
  }

  get typeControl() {
    return this.messageForm.get('type')!;
  }

  get subjectControl() {
    return this.messageForm.get('subject')!;
  }

  get messageControl() {
    return this.messageForm.get('message')!;
  }

  onSubmit(): void {
    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const payload = this.messageForm.getRawValue() as CreateMessageRequest;
    this.isSubmitting = true;
    this.messageForm.disable();

    this.messagesService
      .createMessage(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.messageForm.enable();
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Message sent successfully. We’ll contact you soon.');
          this.messageForm.reset({
            name: '',
            email: '',
            phone: '',
            type: this.defaultType,
            subject: '',
            message: ''
          });
        },
        error: (error) => {
          const friendlyMessage =
            error?.error?.message ||
            'Something went wrong while sending your message. Please try again.';
          this.toastr.error(friendlyMessage);
        }
      });
  }
}

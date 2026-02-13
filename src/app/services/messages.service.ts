import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CreateMessageRequest, CreateMessageResponse } from '../pages/message/message.types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private readonly endpoint = `${environment.apiBaseUrl}/messages`;

  constructor(private readonly http: HttpClient) {}

  createMessage(payload: CreateMessageRequest): Observable<CreateMessageResponse> {
    return this.http.post<CreateMessageResponse>(this.endpoint, payload);
  }
}

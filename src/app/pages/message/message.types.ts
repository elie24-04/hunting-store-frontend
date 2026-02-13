export enum MessageType {
  ProductInquiry = 'PRODUCT_INQUIRY',
  TripQuestion = 'TRIP_QUESTION',
  Complaint = 'COMPLAINT',
  Partnership = 'PARTNERSHIP',
  Other = 'OTHER'
}

export interface CreateMessageRequest {
  name: string;
  email: string;
  phone?: string;
  type: MessageType;
  subject: string;
  message: string;
}

export interface CreateMessageResponse {
  id: string;
  status: string;
}

export const MESSAGE_TYPE_OPTIONS: { value: MessageType; label: string }[] = [
  { value: MessageType.ProductInquiry, label: 'Product inquiry' },
  { value: MessageType.TripQuestion, label: 'Trip question' },
  { value: MessageType.Complaint, label: 'Complaint' },
  { value: MessageType.Partnership, label: 'Partnership' },
  { value: MessageType.Other, label: 'Other' }
];

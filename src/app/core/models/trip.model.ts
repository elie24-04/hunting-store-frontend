export interface Trip {
  id: string;
  title: string;
  location: string;
  durationDays: number;
  season: string;
  pricePerPerson: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxPeople: number;
  images: string[];
  description: string;
  included: string[];
  notIncluded: string[];
  requirements: string[];
  meetingPoint: string;
  availableDates: string[];
}

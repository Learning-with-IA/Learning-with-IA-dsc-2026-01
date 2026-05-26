export class CreateEventDto {
  title: string;
  description?: string;
  eventDate: Date;
  location?: string;
  capacity?: number;
}

export class UpdateEventDto {
  title?: string;
  description?: string;
  eventDate?: Date;
  location?: string;
  capacity?: number;
  isActive?: boolean;
}

import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@2ntickets/common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}

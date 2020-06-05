import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  TicketUpdatedEvent,
  NotFoundError,
} from '@2ntickets/common';
import { Ticket } from '../../models';
import { queueGroupName } from './queue-group-names';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { id, version, title, price } = data;
    const ticket = await Ticket.findByIdAndPreviousVersion(id, version);

    if (!ticket) throw new NotFoundError();

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}

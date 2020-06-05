import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@2ntickets/common';
import { Ticket } from '../../models';
import { queueGroupName } from './queue-group-names';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;
    const ticket = Ticket.build({ title, price, _id: id });
    await ticket.save();
    msg.ack();
  }
}

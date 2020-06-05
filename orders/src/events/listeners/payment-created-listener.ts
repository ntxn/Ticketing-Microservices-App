import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  NotFoundError,
  OrderStatus,
} from '@2ntickets/common';
import { Order } from '../../models';
import { queueGroupName } from './queue-group-names';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const { orderId } = data;
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError();
    order.set({ status: OrderStatus.Completed });
    await order.save();
    msg.ack();
  }
}

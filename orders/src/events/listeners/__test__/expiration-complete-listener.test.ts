import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent, OrderStatus } from '@2ntickets/common';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { title, price } from '../../../test/fixtures';
import { Ticket, Order } from '../../../models';

const setup = async () => {
  // Create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    _id: new mongoose.Types.ObjectId().toHexString(),
    title,
    price,
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: '23123',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  // Create a fake data event
  const data: ExpirationCompleteEvent['data'] = { orderId: order.id };

  // Create a fake Message Object (node-nats-streaming)
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it('Updates the order status to cancelled', async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Emits an Order Cancelled event', async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const { id } = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(id).toEqual(order.id);
});

it('Acknowledges the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

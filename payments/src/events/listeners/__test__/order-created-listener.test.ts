import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@2ntickets/common';

import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { price } from '../../../test/fixtures';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'dsfsdf',
    userId: 'dsfsdf',
    status: OrderStatus.Created,
    ticket: { id: 'dsfdf', price },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('Replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('Acknowledges the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

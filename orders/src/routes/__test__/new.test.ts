import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus, Ticket } from '../../models';
import { ordersApiEndpoint, title, price } from '../../test/fixtures';
import { natsWrapper } from '../../nats-wrapper';

it('Returns an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .post(ordersApiEndpoint)
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('Returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({ title, price });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'dsfdf',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post(ordersApiEndpoint)
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('Reserves a ticket', async () => {
  const ticket = Ticket.build({ title, price });
  await ticket.save();

  await request(app)
    .post(ordersApiEndpoint)
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('Emits an order created event', async () => {
  const ticket = Ticket.build({ title, price });
  await ticket.save();

  await request(app)
    .post(ordersApiEndpoint)
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

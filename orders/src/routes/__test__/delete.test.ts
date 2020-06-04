import request from 'supertest';

import { app } from '../../app';
import { Order, OrderStatus, Ticket } from '../../models';
import { ordersApiEndpoint, title, price } from '../../test/fixtures';
import { natsWrapper } from '../../nats-wrapper';

it('Marks an order as cancelled', async () => {
  // Create a ticket with Ticket Model
  const ticket = Ticket.build({ title, price });
  await ticket.save();

  const user = global.signin();
  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post(ordersApiEndpoint)
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to cancel the order
  await request(app)
    .delete(`${ordersApiEndpoint}/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  // Expection to make sure the ticket is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Emits an order cancelled event', async () => {
  const ticket = Ticket.build({ title, price });
  await ticket.save();

  const user = global.signin();
  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post(ordersApiEndpoint)
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to cancel the order
  await request(app)
    .delete(`${ordersApiEndpoint}/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

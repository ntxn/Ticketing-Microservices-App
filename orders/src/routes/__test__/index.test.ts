import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models';
import { ordersApiEndpoint, title, price } from '../../test/fixtures';

const buildTicket = async () => {
  const ticket = Ticket.build({ title, price });
  await ticket.save();
  return ticket;
};

it('Fetches orders for an particular user', async () => {
  // Create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  // Create one order as User #1
  await request(app)
    .post(ordersApiEndpoint)
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Create two orders as User #2
  const { body: orderOne } = await request(app)
    .post(ordersApiEndpoint)
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post(ordersApiEndpoint)
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // Make request to get orders for User #2
  const { body: orders } = await request(app)
    .get(ordersApiEndpoint)
    .set('Cookie', userTwo)
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(orders.length).toEqual(2);
  expect(orders[0].id).toEqual(orderOne.id);
  expect(orders[1].id).toEqual(orderTwo.id);
  expect(orders[0].ticket.id).toEqual(ticketTwo.id);
  expect(orders[1].ticket.id).toEqual(ticketThree.id);
});

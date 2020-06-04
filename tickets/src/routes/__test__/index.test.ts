import request from 'supertest';
import { app } from '../../app';
import { ticketsApiEndpoint, title, price } from '../../test/fixtures';

const createTicket = () => {
  return request(app)
    .post(ticketsApiEndpoint)
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);
};

it('Can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app)
    .get(ticketsApiEndpoint)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
});

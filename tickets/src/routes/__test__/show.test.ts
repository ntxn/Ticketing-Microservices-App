import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { ticketsApiEndpoint, title, price } from '../../test/fixtures';

it('Returns a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`${ticketsApiEndpoint}/${id}`).send().expect(404);
});

it('Returns the ticket if the ticket is found', async () => {
  const response = await request(app)
    .post(ticketsApiEndpoint)
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`${ticketsApiEndpoint}/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

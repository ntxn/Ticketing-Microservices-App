import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { ticketsApiEndpoint, title, price } from '../../test/fixtures';

it('Returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`${ticketsApiEndpoint}/${id}`)
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(404);
});

it('Returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`${ticketsApiEndpoint}/${id}`)
    .send({ title, price })
    .expect(401);
});

it('Returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post(ticketsApiEndpoint)
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  await request(app)
    .put(`${ticketsApiEndpoint}/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(401);
});

it('Returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post(ticketsApiEndpoint)
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201);

  await request(app)
    .put(`${ticketsApiEndpoint}/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price })
    .expect(400);

  await request(app)
    .put(`${ticketsApiEndpoint}/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title, price: -10 })
    .expect(400);
});

it('Updates the ticket provided valid input', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post(ticketsApiEndpoint)
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201);

  const newTitle = 'New concert';
  const newPrice = 100;

  await request(app)
    .put(`${ticketsApiEndpoint}/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`${ticketsApiEndpoint}/${response.body.id}`)
    .send();
  expect(ticketResponse.body.title).toEqual(newTitle);
  expect(ticketResponse.body.price).toEqual(newPrice);
});

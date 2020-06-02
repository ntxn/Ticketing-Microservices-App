import request from 'supertest';
import { app } from '../../app';

import {
  signupEndpoint,
  signinEndpoint,
  validCredentials,
} from '../../test/fixtures';

it('Fails when an email that does not exist is provided', async () => {
  await request(app).post(signinEndpoint).send(validCredentials).expect(400);
});

it('Fails when an incorrect password is provided', async () => {
  await request(app).post(signupEndpoint).send(validCredentials).expect(201);

  await request(app)
    .post(signinEndpoint)
    .send({ email: 'test@test.com', password: 'dsfsdfsd' })
    .expect(400);
});

it('Responds with a cookie when given valid credentials', async () => {
  await request(app).post(signupEndpoint).send(validCredentials).expect(201);

  const response = await request(app)
    .post(signinEndpoint)
    .send(validCredentials)
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});

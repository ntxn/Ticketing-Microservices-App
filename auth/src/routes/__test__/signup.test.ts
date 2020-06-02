import request from 'supertest';
import { app } from '../../app';

import {
  signupEndpoint,
  validCredentials,
  invalidEmailCredentials,
  invalidPasswordCredentials,
  emailOnlyCredential,
  passwordOnlyCredential,
} from '../../test/fixtures';

it('Returns a 201 on successful signup', async () => {
  return request(app).post(signupEndpoint).send(validCredentials).expect(201);
});

it('Returns a 400 with an invalid email', async () => {
  return request(app)
    .post(signupEndpoint)
    .send(invalidEmailCredentials)
    .expect(400);
});

it('Returns a 400 with an invalid password', async () => {
  return request(app)
    .post(signupEndpoint)
    .send(invalidPasswordCredentials)
    .expect(400);
});

it('Returns a 400 with missing email and password', async () => {
  await request(app).post(signupEndpoint).send(emailOnlyCredential).expect(400);

  await request(app)
    .post(signupEndpoint)
    .send(passwordOnlyCredential)
    .expect(400);
});

it('Disallows duplicate emails', async () => {
  await request(app).post(signupEndpoint).send(validCredentials).expect(201);

  await request(app).post(signupEndpoint).send(validCredentials).expect(400);
});

it('Sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post(signupEndpoint)
    .send(validCredentials)
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});

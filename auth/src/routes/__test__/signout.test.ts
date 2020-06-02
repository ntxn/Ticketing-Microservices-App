import request from 'supertest';

import { app } from '../../app';
import {
  signupEndpoint,
  signoutEndpoint,
  validCredentials,
} from '../../test/fixtures';

it('Clears the cookie after signing out', async () => {
  await request(app).post(signupEndpoint).send(validCredentials).expect(201);

  const response = await request(app)
    .post(signoutEndpoint)
    .send({})
    .expect(200);

  expect(response.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});

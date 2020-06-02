import request from 'supertest';

import { app } from '../../app';
import { currentUserEndpoint, validCredentials } from '../../test/fixtures';

it('Responds with details about the current user', async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get(currentUserEndpoint)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual(validCredentials.email);
});

it('Responds with null if not authenticated', async () => {
  const response = await request(app)
    .get(currentUserEndpoint)
    .send()
    .expect(200);
  expect(response.body.currentUser).toEqual(null);
});

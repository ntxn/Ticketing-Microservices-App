import request from 'supertest';
import mongoose from 'mongoose';
import { OrderStatus } from '@2ntickets/common';

import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';
import { paymentsApiEndpoint } from '../../test/fixtures';

// jest.mock('../../stripe');

it('Returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post(paymentsApiEndpoint)
    .set('Cookie', global.signin())
    .send({
      token: 'tok_visa',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns a 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post(paymentsApiEndpoint)
    .set('Cookie', global.signin())
    .send({ token: 'tok_visa', orderId: order.id })
    .expect(401);
});

it('Returns a 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 1,
    userId,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post(paymentsApiEndpoint)
    .set('Cookie', global.signin(userId))
    .send({ token: 'tok_visa', orderId: order.id })
    .expect(400);
});

it('Returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    price,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post(paymentsApiEndpoint)
    .set('Cookie', global.signin(userId))
    .send({ token: 'tok_visa', orderId: order.id })
    .expect(201);

  const { data } = await stripe.charges.list({ limit: 50 });
  const charge = data.find((charge) => charge.amount === price * 100);

  expect(charge).toBeDefined();
  expect(charge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: charge!.id,
  });
  expect(payment).not.toBeNull();
});

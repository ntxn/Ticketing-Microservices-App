import { Ticket } from '../ticket';
import { title, price } from '../../test/fixtures';

it('Implements optimistic concurrency control', async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({ title, price, userId: '123' });

  // Save the ticket to the database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  firstInstance!.set({ price: 15 });

  // save the first fetch ticket
  await firstInstance!.save();

  // Save the second fetch ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }

  throw new Error('Should not reach this point');
});

it('Increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({ title, price, userId: '123' });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});

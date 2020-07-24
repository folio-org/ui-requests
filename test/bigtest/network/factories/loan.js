import { Factory, trait } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  systemReturnDate: () => faker.date.recent().toISOString(),
  returnDate: () => faker.date.recent().toISOString(),
  dueDate: () => faker.date.recent().toISOString(),
  action: () => 'checkedin',
  loanPolicyId: () => faker.random.uuid(),
  checkoutServicePointId: () => faker.random.uuid(),
  checkinServicePointId: () => faker.random.uuid(),
  status: () => 'Closed',

  withUser: trait({
    afterCreate(loan, server) {
      const user = server.create('user');
      loan.user = user;
      loan.save();
    }
  })
});

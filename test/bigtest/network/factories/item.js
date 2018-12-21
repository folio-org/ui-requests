import { Factory, faker, trait } from '@bigtest/mirage';

export default Factory.extend({
  title: () => faker.company.catchPhrase(),
  barcode: () => Math.floor(Math.random() * 9000000000000) + 1000000000000,
  instanceId: () => faker.random.uuid(),
  callNumber: () => Math.floor(Math.random() * 90000000) + 10000000,
  holdingsRecordId: () => faker.random.uuid(),

  materialType: () => {
    return { name: faker.random.word() };
  },

  status: () => {
    return { name: 'Available' };
  },

  location: () => {
    return { name: faker.random.word() };
  },

  withLoan: trait({
    afterCreate(item, server) {
      server.create('loan', 'withUser', {
        item
      });
    }
  })
});

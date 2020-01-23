import { Factory, faker, trait } from '@bigtest/mirage';

export default Factory.extend({
  title: () => faker.company.catchPhrase(),
  barcode: () => Math.floor(Math.random() * 9000000000000) + 1000000000000,
  instanceId: () => faker.random.uuid(),
  callNumber: () => Math.floor(Math.random() * 90000000) + 10000000,

  materialType: () => {
    return { name: faker.random.word() };
  },

  status: () => {
    return { name: 'Paged' };
  },

  location: () => {
    return { name: faker.random.word() };
  },

  contributorNames: () => [{ name : faker.internet.userName() }],
  copyNumber: () => {
    return Math.floor(Math.random() * 90000000) + 10000000;
  },

  withLoan: trait({
    afterCreate(item, server) {
      server.create('loan', 'withUser', {
        item
      });
    }
  })
});

import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  name: () => faker.company.catchPhrase(),
  code: () => Math.floor(Math.random() * 90000000) + 10000000,
  discoveryDisplayName: () => faker.company.catchPhrase(),
  pickupLocation : true,
});

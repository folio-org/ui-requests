import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  name: () => faker.company.catchPhrase(),
  code: () => Math.floor(Math.random() * 90000000) + 10000000,
  discoveryDisplayName: () => faker.company.catchPhrase(),
  pickupLocation : true,
});

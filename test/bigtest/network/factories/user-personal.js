import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  lastName: () => faker.name.lastName(),
  firstName: () => faker.name.firstName(),
  middlename: () => faker.name.firstName(),
  email: () => faker.internet.email(),
  phone: () => faker.phone.phoneNumber(),
  mobilePhone: () => faker.phone.phoneNumber(),
  dateOfBirth: () => faker.date.past().toISOString().substring(0, 10),
  preferredContactTypeId: () => '003',
  afterCreate(userPersonal, server) {
    const addresses = server.createList('address', 1);
    userPersonal.update('addresses', addresses);
    userPersonal.save();
  }
});

import { trait, association } from '@bigtest/mirage';

import Factory from './application';

export default Factory.extend({
  permanentLocationId: 'fcd64ce1-6995-48f0-840e-89ffa2288371',
  hrid: () => Math.floor(Math.random() * 90000000) + 10000000,
  electronicAccess: [],
  formerIds: [],
  holdingsItems: [],
  holdingsStatements: [],
  holdingsStatementsForIndexes: [],
  holdingsStatementsForSupplements: [],
  notes: [],
  statisticalCodeIds: [],
  instance: association(),

  withItem: trait({
    afterCreate(holding, server) {
      const item = server.create('item');
      holding.items = [item];
      holding.save();
      item.save();
    }
  }),

  withItems: trait({
    afterCreate(holding, server) {
      const items = server.createList('item', 3);
      holding.items = items;
      holding.save();
      items.forEach(item => item.save());
    }
  }),

  withPagedItems: trait({
    afterCreate(holding, server) {
      const items = server.createList('item', 3, {
        instanceId: holding.instanceId,
        status: { name: 'Paged' },
      });
      holding.items = items;
      holding.save();
    }
  })
});

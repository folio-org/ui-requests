/* istanbul ignore file */

// default scenario is used during `yarn start --mirage`
export default function defaultScenario(server) {
  server.create('servicePoint', {
    id: 'servicepointId1',
    name: 'Circ Desk 1',
    code: 'cd1',
    discoveryDisplayName: 'Circulation Desk -- Hallway',
    pickupLocation: true,
  });

  server.create('servicePoint', {
    id: 'servicepointId2',
    name: 'Circ Desk 2',
    code: 'cd2',
    discoveryDisplayName: 'Circulation Desk -- Back Entrance',
    pickupLocation: true,
  });

  server.createList('request', 20);
}

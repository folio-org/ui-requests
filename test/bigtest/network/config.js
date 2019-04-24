// eslint-disable-next-line jsx-a11y/label-has-associated-control
import CQLParser, { CQLBoolean } from './cql';

// typical mirage config export
// http://www.ember-cli-mirage.com/docs/v0.4.x/configuration/
export default function config() {
  // okapi endpoints
  this.get('/_/version', () => '0.0.0');

  this.get('_/proxy/tenants/:id/modules', []);

  this.get('/saml/check', {
    ssoEnabled: false
  });

  this.get('/configurations/entries', {
    configs: []
  });
  this.post('/bl-users/login', () => {
    return new Response(201, {
      'X-Okapi-Token': `myOkapiToken:${Date.now()}`
    }, {
      user: {
        id: 'test',
        username: 'testuser',
        personal: {
          lastName: 'User',
          firstName: 'Test',
          email: 'user@folio.org',
        }
      },
      permissions: {
        permissions: []
      }
    });
  });
  this.get('/groups', {
    'usergroups': [{
      'group': 'alumni_1383',
      'desc': 'Alumni',
      'id': 'group1',
    }, {
      'group': 'alumni_2121',
      'desc': 'Alumni',
      'id': 'group2',
    }, {
      'group': 'alumni_6422',
      'desc': 'Alumni',
      'id': 'group3',
    }, {
      'group': 'faculty',
      'desc': 'Faculty Member',
      'id': 'group4',
    }, {
      'group': 'graduate',
      'desc': 'Graduate Student',
      'id': 'group5',
    }, {
      'group': 'staff',
      'desc': 'Staff Member',
      'id': 'group6',
    }, {
      'group': 'undergrad',
      'desc': 'Undergraduate Student',
      'id': 'group7',
    }],
    'totalRecords': 7
  });
  this.get('/addresstypes', {
    'addressTypes': [{
      'addressType': 'Claim',
      'desc': 'Claim Address',
      'id': 'Type1',
    }, {
      'addressType': 'Home',
      'desc': 'Home Address',
      'id': 'Type2',
    }, {
      'addressType': 'Order',
      'desc': 'Order Address',
      'id': 'Type3',
    }, {
      'addressType': 'Payment',
      'desc': 'Payment Address',
      'id': 'Type4',
    }, {
      'addressType': 'Returns',
      'desc': 'Returns Address',
      'id': 'Type5',
    }, {
      'addressType': 'Work',
      'desc': 'Work Address',
      'id': 'Type6',
    }],
    'totalRecords': 6
  });

  this.get('/users', ({ users }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      const { field, term } = cqlParser.tree;

      return users.where({ [field]: term });
    } else {
      return users.all();
    }
  });

  this.get('/users/:id', (schema, request) => {
    return schema.users.find(request.params.id).attrs;
  });
  this.get('/proxiesfor', {
    proxiesFor: [],
    totalRecords: 0,
  });
  this.get('/service-points-users', ({ servicePointsUsers }, request) => {
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');
    const cqlParser = new CQLParser();
    cqlParser.parse(cqlQuery);
    return servicePointsUsers.where({
      userId: cqlParser.tree.term
    });
  });

  this.get('/service-points', ({ servicePoints }) => {
    return servicePoints.all();
  });

  this.get('/circulation/loans', {
    loans: [],
    totalRecords: 0,
  });
  this.get('/requests', {
    requests: [],
    totalRecords: 0,
  });
  this.get('accounts', {
    accounts: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('waives', {
    waiver: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('payments', {
    payments: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('comments', {
    comments: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('feefines', {
    feefines: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('/manualblocks', {
    manualblocks: [],
    totalRecords: 0,
  });
  this.get('/perms/users/:id/permissions', {
    permissionNames: [],
  });
  this.get('/perms/permissions', {
    permissions: [],
    totalRecords: 0,
  });
  this.get('/feefineactions', {
    feefineactions: [],
    totalRecords: 0,
  });
  this.get('/owners', {
    owners: [],
    totalRecords: 0,
  });

  this.get('/circulation/requests', ({ requests }) => {
    return requests.all();
  });

  this.get('/circulation/requests/:id', ({ requests }, request) => {
    return requests.find(request.params.id);
  });

  this.post('/circulation/requests', (_, request) => {
    const body = JSON.parse(request.requestBody);
    return this.create('request', body);
  });

  this.put('/circulation/requests/:id', ({ requests }, request) => {
    const body = JSON.parse(request.requestBody);
    const reqModel = requests.find(body.id);
    const defaultReq = this.build('request');
    return reqModel.update({ ...defaultReq, ...body });
  });

  this.get('/request-storage/requests', ({ requests }, request) => {
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');
    const cqlParser = new CQLParser();
    cqlParser.parse(cqlQuery);

    return requests.where({
      itemId: cqlParser.tree.term
    });
  });

  this.get('/request-storage/requests/:id', (schema, request) => {
    return schema.requests.find(request.params.id).attrs;
  });
  this.get('/cancellation-reason-storage/cancellation-reasons', {
    cancellationReasons: [{
      id: '75187e8d-e25a-47a7-89ad-23ba612338de',
      name: 'Patron Cancelled',
      description : 'Cancelled at patron’s request',
      requiresAdditionalInformation: false,
    }, {
      id: 'b548b182-55c2-4741-b169-616d9cd995a8',
      name: 'Other',
      description: 'Other',
      requiresAdditionalInformation: true,
    }, {
      id: '1c0e9ba1-6a97-4bbc-94fc-83eecc32f5fd',
      name: 'Needed For Course Reserves',
      description: 'Item is needed for course reserves',
      publicDescription: 'Item is no longer available for request',
      requiresAdditionalInformation: false,
    }, {
      id: 'ff474f60-d9ce-4bd8-8659-eb51af825a56',
      name: 'Item Not Available',
      description: 'Item is no longer available',
      requiresAdditionalInformation: false,
    }],
    totalRecords : 4,
  });

  this.get('/inventory/items', ({ items }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      const { field, term } = cqlParser.tree;
      return items.where({ [field]: term });
    } else {
      return items.all();
    }
  });

  this.get('/circulation/loans', ({ loans }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      if (cqlParser.tree instanceof CQLBoolean) {
        return loans.where({
          itemId: cqlParser.tree.left.term
        });
      } else {
        return loans.where({
          itemId: cqlParser.tree.term
        });
      }
    } else {
      return loans.all();
    }
  });
}

import ApplicationSerializer from './application';

const { isArray } = Array;

export default ApplicationSerializer.extend({

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.requests)) {
      return {
        ...json,
        totalRecords: json.requests.length,
      };
    } else {
      return json.request;
    }
  }
});

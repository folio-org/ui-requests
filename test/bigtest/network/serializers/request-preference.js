import ApplicationSerializer from './application';

const { isArray } = Array;
const { assign } = Object;

export default ApplicationSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (isArray(json.requestPreferences)) {
      return assign({}, { requestPreferences: json.requestPreferences }, {
        totalRecords: json.requestPreferences.length,
      });
    }

    return json.requestPreferences;
  }
});
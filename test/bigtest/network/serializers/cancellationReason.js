import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);
    const totalRecords = json.cancellationReasons.length;

    console.log('json', json);

    return Object.assign({}, json, { totalRecords });
  }
});

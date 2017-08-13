import React from 'react';
import PropTypes from 'prop-types';

import Button from '@folio/stripes-components/lib/Button';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import stripesForm from '@folio/stripes-form';

class RequestForm extends React.Component {

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    reset: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    onCancel: PropTypes.func,
    initialValues: PropTypes.object,
  //  okapi: PropTypes.object,
  };

  constructor(props) {
    super(props);
  }

  render() {

    const {
      handleSubmit,
      reset,  // eslint-disable-line no-unused-vars
      pristine,
      submitting,
      onCancel,
      initialValues,
    } = this.props;

    const addRequestFirstMenu = <PaneMenu><Button onClick={onCancel} title="close" aria-label="Close New Request Dialog"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></Button></PaneMenu>;
    const addRequestLastMenu = <PaneMenu><Button type="submit" title="Create New Request" disabled={pristine || submitting} onClick={handleSubmit}>Create Request</Button></PaneMenu>;
    const editRequestLastMenu = <PaneMenu><Button type="submit" title="Update Request" disabled={pristine || submitting} onClick={handleSubmit}>Update Request</Button></PaneMenu>;

    return (
      <form id="form-requests" style={{ height: '100%', overflow: 'auto' }}>
        <Paneset isRoot>
          <Pane defaultWidth="100%" firstMenu={addRequestFirstMenu} lastMenu={false ? editRequestLastMenu : addRequestLastMenu} paneTitle={false ? 'Edit Request' : 'New Request'}>

          </Pane>
        </Paneset>
      </form>
    );
  }
}

export default stripesForm({
  form: 'requestForm',

  navigationCheck: true,
})(RequestForm);

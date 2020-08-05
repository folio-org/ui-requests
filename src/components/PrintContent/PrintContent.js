import React, { forwardRef, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';

import ComponentToPrint from '../ComponentToPrint';
import { buildTemplate } from '../../utils';

import css from './PrintContent.css';

const PrintContent = forwardRef(({ dataSource, template }, ref) => {
  const templateFn = useMemo(() => buildTemplate(template), [template]);

  return (
    <div className={css.hiddenContent}>
      <div ref={ref}>
        {dataSource.map(source => (
          <div
            key={source['request.requestID']}
            style={{ pageBreakAfter: 'always' }}
          >
            <ComponentToPrint
              dataSource={source}
              templateFn={templateFn}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

PrintContent.propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  template: PropTypes.string.isRequired,
};

export default memo(PrintContent, isEqual);


import React from 'react';

import { Layout } from '@folio/stripes/components';

import css from './DotSpinner.css';

const Loading = () => {
  const spinnerStyle = { maxWidth: '15rem', height: '8rem' };

  return (
    <Layout
      data-testid="loading"
      className="centered full"
      style={spinnerStyle}
    >
      <div className={css.spinner}>
        <div className={css.bounce1} />
        <div className={css.bounce2} />
        <div />
      </div>
    </Layout>
  );
};

export default Loading;

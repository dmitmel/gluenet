import React from 'react';
import PropTypes from 'prop-types';

import './Pane.scss';

Pane.propTypes = {
  header: PropTypes.oneOfType([PropTypes.func, PropTypes.element])
};

export default function Pane(props) {
  return (
    <div className="pane">
      <header className="pane-header bg-primary">{props.header}</header>
      <main role="main" className="pane-content">
        {props.children}
      </main>
    </div>
  );
}

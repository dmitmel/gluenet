import React from 'react';
import PropTypes from 'prop-types';

import './Header.scss';

MenuHeader.propTypes = {
  toggleMenu: PropTypes.func
};

export default function MenuHeader({ toggleMenu }) {
  return (
    <header className="menu-header bg-primary-dark">
      <button
        type="button"
        className="menu-header__toggle-menu btn btn-icon bg-primary-dark-contrast"
        onClick={toggleMenu}
        aria-label="Toggle menu">
        <i className="fa fa-bars" aria-hidden="true" />
      </button>
      <h4 className="menu-header__brand">
        <a href="#/">GlueNet</a>
      </h4>
    </header>
  );
}

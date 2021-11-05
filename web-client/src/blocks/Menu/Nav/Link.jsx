import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Link.scss';

export default class MenuNavLink extends Component {
  static propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  };

  _onHashChange = () => {
    this.setState({ path: window.location.hash.slice(1) });
  };

  componentWillMount() {
    this._onHashChange();
  }

  componentDidMount() {
    window.addEventListener('hashchange', this._onHashChange);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this._onHashChange);
  }

  render() {
    let to = this.props.to;
    let className = 'menu-nav-link nav-link';
    if (this.state.path === to) className += ' menu-nav-link_active';

    return (
      <a href={`#${to}`} className={className}>
        <i
          className={`menu-nav-link__icon fa fa-${this.props.icon}`}
          aria-hidden="true"
        />
        <span className="menu-nav-link__text">{this.props.text}</span>
      </a>
    );
  }
}

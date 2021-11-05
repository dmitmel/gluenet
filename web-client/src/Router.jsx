import { Component } from 'react';
import PropTypes from 'prop-types';

export default class Router extends Component {
  static propTypes = {
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        path: PropTypes.instanceOf(RegExp).isRequired,
        render: PropTypes.func,
        props: PropTypes.object,
        redirect: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
      })
    ).isRequired,
    onPathChange: PropTypes.func
  };

  state = { path: this._getPath() };

  _getPath() {
    return window.location.hash.slice(1);
  }

  _onHashChange = () => {
    let path = this._getPath();
    let onPathChange = this.props.onPathChange;
    if (onPathChange) onPathChange(path);
    this.setState({ path });
  };

  componentDidMount() {
    window.addEventListener('hashchange', this._onHashChange);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this._onHashChange);
  }

  render() {
    let currentPath = this.state.path;

    for (let { path, render, props, redirect } of this.props.routes) {
      let match = path.exec(currentPath);
      if (match) {
        if (redirect) {
          window.location.hash = '#' + redirect;
          return null;
        }

        return render ? render({ match, ...props }) : null;
      }
    }

    return null;
  }
}

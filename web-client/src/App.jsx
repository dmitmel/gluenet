import React, { Component } from 'react';

import TooSmallDevice from './blocks/TooSmallDevice';
import Menu from './blocks/Menu';
import Pane from './blocks/Pane';
import Search from './blocks/Search';
import Router from './Router';

const ROUTES = [
  {
    path: /^\/hosts\/?$/,
    render: () => (
      <Pane
        header={
          <Search
            placeholder="Search hosts"
            onSearch={query => window.location.hash = `#/search/${query}`}
          />
        }>
        <h2>Hosts</h2>
      </Pane>
    )
  },
  {
    path: /.*/,
    render: ({ match }) => (
      <Pane>
        <h2>{match.input}</h2>
      </Pane>
    )
  }
];

export default class App extends Component {
  _onWindowResize = () => {
    this.setState({ windowWidth: window.innerWidth });
  };

  componentWillMount() {
    this._onWindowResize();
  }

  componentDidMount() {
    window.addEventListener('resize', this._onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onWindowResize);
  }

  render() {
    if (this.state.windowWidth < 576) return <TooSmallDevice />;
    return (
      <div>
        <Menu />
        <Router routes={ROUTES} />
      </div>
    );
  }
}

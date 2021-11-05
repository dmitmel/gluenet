import React, { Component } from 'react';
import Transition, {
  EXITED,
  EXITING,
  ENTERING,
  ENTERED
} from 'react-transition-group/Transition';

import MenuHeader from './Menu/Header';
import MenuNav from './Menu/Nav';
import './Menu.scss';

const menuTransitionClasses = {
  [EXITED]: 'menu menu_collapsed',
  [EXITING]: 'menu menu_collapsing',
  [ENTERING]: 'menu menu_expanded',
  [ENTERED]: 'menu menu_expanded'
};

export default class Menu extends Component {
  state = { expanded: true };

  toggle = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  };

  render() {
    return (
      <Transition in={this.state.expanded} timeout={250}>
        {status => (
          <nav className={menuTransitionClasses[status]}>
            <MenuHeader toggleMenu={this.toggle} />
            <MenuNav />
          </nav>
        )}
      </Transition>
    );
  }
}

import React from 'react';

import MenuNavLink from './Nav/Link';
import './Nav.scss';

export default function MenuNav() {
  return (
    <div className="menu-nav">
      <ul className="menu-nav__items">
        <li>
          <MenuNavLink to="/hosts" icon="server" text="Hosts" />
        </li>
        <li>
          <MenuNavLink to="/connections" icon="link" text="Connections" />
        </li>
        <li>
          <MenuNavLink to="/history" icon="history" text="History" />
        </li>
        <li>
          <MenuNavLink to="/settings" icon="cog" text="Settings" />
        </li>
      </ul>
    </div>
  );
}

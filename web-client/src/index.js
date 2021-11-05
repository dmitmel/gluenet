import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import './scss/index.scss';
import App from './App';

registerServiceWorker();

window.addEventListener('load', () => {
  let root = document.getElementById('root');
  ReactDOM.render(<App />, root);
});

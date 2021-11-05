import React from 'react';
import { render } from 'enzyme';

import App from './App';

describe('An app', function() {
  it('renders without crashing', () => {
    render(<App />);
  });
});

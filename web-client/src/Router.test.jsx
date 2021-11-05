import React from 'react';
import { shallow, render } from 'enzyme';
import { stub } from 'sinon';

import Router from './Router';

// =============================================================================
// Helpers
// =============================================================================

let currentPath = '';

function setPath(newPath) {
  window.location.hash = `#${newPath}`;
  // JSDOM doesn't dispatch 'hashchange' event, so it must be dispatched manually
  // https://github.com/tmpvar/jsdom/issues/433
  window.dispatchEvent(new HashChangeEvent('hashchange'));

  currentPath = newPath;
}

// =============================================================================
// Tests
// =============================================================================

describe('A router', function() {
  it('renders without crashing', () => {
    render(<Router routes={[]} />);
  });

  beforeEach(() =>
    // make sure path changes from the previous test don't break behavior of the
    // next one
    setPath('')
  );

  // `window.location.hash`
  // ===========================================================================
  it('should initialize with `window.location.hash`', function() {
    // given:
    setPath('/path');
    let router = shallow(<Router routes={[]} />);
    // then:
    expect(router.state('path')).toEqual(currentPath);
  });

  it('should update path when `window.location.hash` changes', function() {
    // given:
    let router = shallow(<Router routes={[]} />);
    // when:
    setPath('/path');
    // then:
    expect(router.state('path')).toEqual(currentPath);
  });

  // `onPathChange`
  // ===========================================================================
  it('should not call `onPathChange` after init', function() {
    // given:
    setPath('/path');
    let onPathChange = stub();
    shallow(<Router routes={[]} onPathChange={onPathChange} />);
    // then:
    expect(onPathChange.notCalled).toBeTruthy();
  });

  it('should call `onPathChange` when `window.location.hash` changes', function() {
    // given:
    let onPathChange = stub();
    shallow(<Router routes={[]} onPathChange={onPathChange} />);
    // when:
    setPath('/path/new');
    // then:
    expect(onPathChange.calledOnce).toBeTruthy();
    expect(onPathChange.firstCall.args).toEqual([currentPath]);
  });

  it('should not call `onPathChange` after being unmounted', function() {
    // given:
    let onPathChange = stub();
    let router = shallow(<Router routes={[]} onPathChange={onPathChange} />);
    // when:
    router.unmount();
    setPath('/path');
    // then:
    expect(onPathChange.notCalled).toBeTruthy();
  });

  // Routes
  // ===========================================================================
  it('should not render anything after init if route does not have render function', function() {
    // given:
    setPath('/route');
    let routes = [
      {
        path: /^\/route$/
      }
    ];
    let router = shallow(<Router routes={routes} />);
    // then:
    expect(router.isEmptyRender()).toBeTruthy();
  });

  it('should not render anything if route does not have render function', function() {
    // given:
    let routes = [
      {
        path: /^\/route$/
      }
    ];
    let router = shallow(<Router routes={routes} />);
    // when:
    setPath('/route');
    router.update();
    // then:
    expect(router.isEmptyRender()).toBeTruthy();
  });

  it('should render matching route after init', function() {
    // given:
    setPath('/route');
    let route = <h1>/route</h1>;
    let routes = [
      {
        path: /^\/route$/,
        render: () => route
      }
    ];
    let router = shallow(<Router routes={routes} />);
    // then:
    expect(router.equals(route)).toBeTruthy();
  });

  it('should render matching route', function() {
    // given:
    let route = <h1>/route</h1>;
    let routes = [
      {
        path: /^\/route$/,
        render: () => route
      }
    ];
    let router = shallow(<Router routes={routes} />);
    // when:
    setPath('/route');
    router.update();
    // then:
    expect(router.equals(route)).toBeTruthy();
  });

  it('should not render anything after init if there are no matching routes', function() {
    // given:
    setPath('/route/not-matching');
    let routes = [
      {
        path: /^\/route$/,
        render: () => <h1>/route</h1>
      }
    ];
    let router = shallow(<Router routes={routes} />);
    // then:
    expect(router.isEmptyRender()).toBeTruthy();
  });

  it('should not render anything if there are no matching routes', function() {
    // given:
    let routes = [
      {
        path: /^\/route$/,
        render: () => <h1>/route</h1>
      }
    ];
    let router = shallow(<Router routes={routes} />);
    // when:
    setPath('/route/not-matching/other');
    router.update();
    // then:
    expect(router.isEmptyRender()).toBeTruthy();
  });

  // Redirects
  // ===========================================================================
  it('should handle redirects after init', function() {
    // given:
    setPath('/route/1');
    let route = <h1>/route/2</h1>;
    let routes = [
      {
        path: /^\/route\/1$/,
        redirect: '/route/2'
      },
      {
        path: /^\/route\/2$/,
        render: () => route
      }
    ];
    let router = shallow(<Router routes={routes} />);

    router.instance()._onHashChange();
    router.update();
    // then:
    expect(router.equals(route)).toBeTruthy();
  });

  it('should handle redirects', function() {
    // given:
    let route = <h1>/route/2</h1>;
    let routes = [
      {
        path: /^\/route\/1$/,
        redirect: '/route/2'
      },
      {
        path: /^\/route\/2$/,
        render: () => route
      }
    ];
    let router = shallow(<Router routes={routes} />);
    // when:
    setPath('/route/1');
    router.instance()._onHashChange();
    router.update();
    // then:
    expect(router.equals(route)).toBeTruthy();
  });
});

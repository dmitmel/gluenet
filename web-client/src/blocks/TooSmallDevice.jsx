import React from 'react';

import './TooSmallDevice.scss';

export default function TooSmallDevice() {
  return (
    <div className="too-small-device">
      <code className="d-block">
        {'@media screen and (max-width: 575px) {'}
      </code>

      <div className="too-small-device__message text-center">
        <h1 className="text-danger">
          Your device is too <strong>small</strong>
        </h1>
        <div className="fa-stack">
          <i className="fa fa-mobile fa-stack-2x" aria-hidden="true" />
          <i className="fa fa-picture-o fa-stack-1x" aria-hidden="true" />
        </div>
        <div>
          <big>
            Try to change its orientation to <strong>landscape</strong>.
          </big>
        </div>
      </div>

      <code className="d-block">{'}'}</code>
    </div>
  );
}

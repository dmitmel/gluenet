/* eslint-env browser, jquery */
/* global Display */

$(function() {
  'use strict';

  var $window = $(window),
    $display = $('#display');

  var display = new Display($display);

  var textEncoder = new TextEncoder();

  ///////////////////////// SETTING UP WEBSOCKET /////////////////////////
  var ws = new WebSocket('ws://' + location.hostname + ':8080/');

  // close websocket when user closes page
  $window.on('beforeunload', function() {
    if (ws && ws.readyState == WebSocket.OPEN) {
      ws.close();
      ws = null;
    }
  });

  ws.binaryType = 'arraybuffer';

  function packetToString(packet) {
    var str = '<Buffer';
    for (var i = 0; i < packet.length; i++) {
      var byte = packet[i];
      str += ' ' + byte.toString(16);
    }
    return str + '>';
  }

  function send(packet) {
    if (ws && ws.readyState == WebSocket.OPEN) {
      ws.send(packet);
      console.log('> (%d bytes) %s', packet.byteLength, packetToString(packet));
    }
  }

  ws.onopen = function() {
    console.log('WebSocket:  opened');
  };

  var decoder = new TextDecoder('utf-8');

  ws.onmessage = function(e) {
    var packet = new Uint8Array(e.data);
    console.log('< (%d bytes) %s', packet.byteLength, packetToString(packet));

    if (packet[0] == 0) {
      send(new Uint8Array([1, 0, 0]));
      send(new Uint8Array([1, 1, 1]));
      send(new Uint8Array([1, 2, 2]));
      display.clear();
      send(createResizeEvent());
    } else if (packet[0] == 4) {
      var deviceType = packet[1];
      var eventID = packet[2];
      if (deviceType == 0) {
        if (eventID == 2) {
          display.clear();
        } else if (eventID == 3) {
          display.write(packet[3], packet[5], decoder.decode(packet.slice(7)));
        } else if (eventID == 5) {
          display.fill(packet[3], packet[5], packet[7], packet[9], decoder.decode(packet.slice(11)));
        } else if (eventID == 6) {
          display.copy(packet[3], packet[5], packet[7], packet[9], packet[11], packet[13]);
        }
      }
    }
  };

  ws.onclose = function() {
    ws = null;
    console.log('WebSocket:  closed');
  };

  ///////////////////////// DISPLAY EVENTS /////////////////////////
  function createResizeEvent() {
    return new Uint8Array([3, 0, 0, display.width, display.height]);
  }

  $window.resize(function() {
    display.calcSize();
    display.clear();
    send(createResizeEvent());
  });

  ///////////////////////// MOUSE EVENTS /////////////////////////
  function createMouseEvent(evt) {
    var mousePos = display.viewportToDisplay(evt.clientX, evt.clientY);
    return new Uint8Array([
      3,
      1,
      evt.type === 'mouseup' ? 1 : 0,
      mousePos.x,
      mousePos.y,
      evt.button
    ]);
  }

  $window.mousedown(function(evt) {
    send(createMouseEvent(evt));
    return false;
  });
  $window.mouseup(function(evt) {
    send(createMouseEvent(evt));
    return false;
  });
  $window.contextmenu(function() {
    return false;
  });

  var prevMousePos;
  $window.mousemove(function(evt) {
    var mousePos = display.viewportToDisplay(evt.clientX, evt.clientY);
    if (
      prevMousePos &&
      prevMousePos.x == mousePos.x &&
      prevMousePos.y == mousePos.y
    )
      return;
    prevMousePos = mousePos;

    send(new Uint8Array([3, 1, 2, mousePos.x, mousePos.y]));
  });

  ///////////////////////// KEYBOARD EVENTS /////////////////////////
  function createKeyboardEvent(evt) {
    let keyEncoded = textEncoder.encode(evt.key);

    return new Uint8Array([
      3,
      2,
      evt.type == 'keyup' ? 1 : evt.type == 'keypress' ? 2 : 0,
      keyEncoded.length,
      ...keyEncoded
    ]);

    // return {
    //   type: 3,
    //   evt: evt.type == 'keyup' ? 0x401 : evt.type == 'keypress' ? 0x501 : 0x301,
    //   data: {
    //     code: evt.which == null ? evt.keyCode : evt.which,
    //     key: evt.key,
    //     modifiers:
    //       evt.altKey |
    //       (evt.ctrlKey << 1) |
    //       (evt.shiftKey << 2) |
    //       (evt.metaKey << 3)
    //   }
    // };
  }

  $window.keydown(function(evt) {
    send(createKeyboardEvent(evt));
    return false;
  });
  $window.keyup(function(evt) {
    send(createKeyboardEvent(evt));
    return false;
  });
  $window.keypress(function(evt) {
    send(createKeyboardEvent(evt));
    return false;
  });
});

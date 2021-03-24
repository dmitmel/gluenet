import { Device, DEVICE_TYPES } from '../device';

enum EventID {
  DOWN,
  UP,
  MOVE
}

export class Mouse extends Device {
  handleEvent(event: number, data: Buffer): void {
    let x = data.readUInt8(0);
    let y = data.readUInt8(1);

    switch (event) {
      case EventID.DOWN: {
        let button = data.readUInt8(2);
        this.emit('down', { x, y, button });
        break;
      }

      case EventID.UP: {
        let button = data.readUInt8(2);
        this.emit('up', { x, y, button });
        break;
      }

      case EventID.MOVE:
        this.emit('move', { x, y });
        break;
    }
  }
}

DEVICE_TYPES[0x1] = Mouse;

export interface Event {
  x: number;
  y: number;
}

export enum MouseButton {
  LEFT,
  MIDDLE,
  RIGHT
}

export interface PressEvent extends Event {
  button: MouseButton;
}

// export interface KeyboardEvent {
//   code: number;
//   key: string;
//   modifiers: number;
// }

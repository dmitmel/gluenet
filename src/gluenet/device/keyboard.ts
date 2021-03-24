import { Device, DEVICE_TYPES } from '../device';

enum EventID {
  KEYDOWN,
  KEYUP,
  KEYPRESS,
}

export class Keyboard extends Device {
  handleEvent(event: number, data: Buffer): void {
    let keyLength = data.readUInt8(0);
    let key = data.slice(1, 1 + keyLength).toString('utf8');

    switch (event) {
      case EventID.KEYDOWN: {
        this.emit('keydown', { key });
        break;
      }

      case EventID.KEYUP: {
        this.emit('keyup', { key });
        break;
      }

      case EventID.KEYPRESS:
        this.emit('keypress', { key });
        break;
    }
  }
}

DEVICE_TYPES[0x2] = Keyboard;

export interface Event {
  x: number;
  y: number;
}

export interface KeyboardEvent {
  // code: number;
  key: string;
  // modifiers: number;
}

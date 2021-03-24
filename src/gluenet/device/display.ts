import * as _ from 'lodash';

import { Device, DEVICE_TYPES } from '../device';

enum EventID {
  RESIZE
}

export enum Command {
  SET_BACKGROUND,
  SET_FOREGROUND,
  CLEAR,
  WRITE,
  WRITE_VERTICAL,
  FILL,
  COPY
}

export interface ResizeEvent {
  width: number;
  height: number;
}

export class Display extends Device {
  width: number = 0;
  height: number = 0;

  handleEvent(event: number, data: Buffer): void {
    switch (event) {
      case EventID.RESIZE:
        this.width = data.readUInt8(0);
        this.height = data.readUInt8(0);
        this.emit('resize', { width: this.width, height: this.height });
        break;
    }
  }

  background(value: string) {
    this.sendCommand(Command.SET_BACKGROUND, Buffer.from(value));
  }

  foreground(value: string) {
    this.sendCommand(Command.SET_FOREGROUND, Buffer.from(value));
  }

  clear(): void {
    this.sendCommand(Command.CLEAR, Buffer.allocUnsafe(0));
  }

  write(x: number, y: number, str: string): void {
    if (str.length <= 0) return;
    if (x >= this.width || y < 0 || y >= this.height) return;

    if (x < 0) {
      str = str.slice(-x);
      x = 0;
    }
    if (x + str.length > this.width) {
      str = str.slice(0, this.width - x);
    }

    let packet: Buffer = Buffer.allocUnsafe(4 + Buffer.byteLength(str));
    packet.writeUInt16LE(x, 0);
    packet.writeUInt16LE(y, 2);
    packet.write(str, 4);
    this.sendCommand(Command.WRITE, packet);
  }

  writeVertical(x: number, y: number, str: string): void {
    if (str.length <= 0) return;
    if (x < 0 || x >= this.width || y >= this.height) return;

    if (y < 0) {
      str = str.slice(-y);
      y = 0;
    }
    if (y + str.length > this.height) {
      str = str.slice(0, this.height - y);
    }

    let packet: Buffer = Buffer.allocUnsafe(4 + Buffer.byteLength(str));
    packet.writeUInt16LE(x, 0);
    packet.writeUInt16LE(y, 2);
    packet.write(str, 4);
    this.sendCommand(Command.WRITE_VERTICAL, packet);
  }

  fill(
    x: number,
    y: number,
    width: number,
    height: number,
    char: string
  ): void {
    char = _.isString(char) ? char[0] : ' ';

    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (width < 0 || height < 0) return;
    if (x + width > this.width) width = this.width - x;
    if (y + height > this.height) height = this.height - y;

    let packet: Buffer = Buffer.allocUnsafe(8 + Buffer.byteLength(char));
    packet.writeUInt16LE(x, 0);
    packet.writeUInt16LE(y, 2);
    packet.writeUInt16LE(width, 4);
    packet.writeUInt16LE(height, 6);
    packet.write(char, 8);
    this.sendCommand(Command.FILL, packet);
  }

  fillCol(col: number, char: string): void {
    this.fill(col, 0, 1, this.height, char);
  }

  fillLine(line: number, char: string): void {
    this.fill(0, line, this.width, 1, char);
  }

  move(
    x: number,
    y: number,
    width: number,
    height: number,
    mx: number,
    my: number
  ): void {
    this.copy(x, y, width, height, x + mx, y + my);
  }

  copy(
    x: number,
    y: number,
    width: number,
    height: number,
    tx: number,
    ty: number
  ): void {
    if (tx === 0 && ty === 0) return;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (width < 0 || height < 0) return;
    if (x + width > this.width) width = this.width - x;
    if (y + height > this.height) height = this.height - y;

    let packet: Buffer = Buffer.allocUnsafe(12);
    packet.writeUInt16LE(x, 0);
    packet.writeUInt16LE(y, 2);
    packet.writeUInt16LE(width, 4);
    packet.writeUInt16LE(height, 6);
    packet.writeUInt16LE(tx, 8);
    packet.writeUInt16LE(ty, 10);
    this.sendCommand(Command.COPY, packet);
  }
}

DEVICE_TYPES[0x0] = Display;

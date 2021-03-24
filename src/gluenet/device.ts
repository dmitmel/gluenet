import { EventEmitter } from 'events';

import { PacketType } from './packet';
import { Client } from './client';

/**
 * An object with constructors of devices. When a
 * [`Server`](../classes/_gluenet_server_.server.html) receives an
 * {@linkcode PacketType.ADD_DEVICE} packet, it takes a device constructor from
 * this object.
 */
export const DEVICE_TYPES: {
  [type: number]: new (client: Client, id: number) => Device;
} = {};

/**
 * A class for connected devices.
 * @see [**The Binary Protocol**](../modules/_gluenet_packet_.html#the-binary-protocol)
 */
export abstract class Device extends EventEmitter {
  /**
   * Creates an instance of Device.
   *
   * @param {Client} client client that owns this device
   * @param {number} id     8-bit device ID
   */
  constructor(readonly client: Client, readonly id: number) {
    super();
  }

  /**
   * Should be implemented by devices to handle incoming events.
   *
   * @param {number} event 8-bit event ID
   * @param {Buffer} data  event data
   */
  abstract handleEvent(event: number, data: Buffer): void;

  /**
   * Send a command to remote device.
   *
   * @param {number} cmd  8-bit command ID
   * @param {Buffer} data command data
   */
  sendCommand(cmd: number, data: Buffer): void {
    let packet: Buffer = Buffer.allocUnsafe(3 + data.length);
    packet.writeUInt8(PacketType.COMMAND, 0);
    packet.writeUInt8(this.id, 1);
    packet.writeUInt8(cmd, 2);
    data.copy(packet, 3);
    this.client.send(packet);
  }
}

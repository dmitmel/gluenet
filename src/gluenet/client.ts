import { isFunction } from 'lodash';
import * as debug from 'debug';
import { EventEmitter } from 'events';
import * as WebSocket from 'ws';

import { PacketType } from './packet';
import { Device, DEVICE_TYPES } from './device';

/**
 * A class for connected clients.
 * @see [**The Binary Protocol**](../modules/_gluenet_packet_.html#the-binary-protocol)
 */
export class Client extends EventEmitter {
  /** A set of connected devices. */
  devices: Set<Device> = new Set();

  private log: debug.IDebugger;
  private logPacket: debug.IDebugger;

  constructor(
    /** An underlying WebSocket. */
    readonly ws: WebSocket,
    /** Client's IP address (may not be accurate if proxy is used). */
    readonly address: string,
    /** Client's 8-bit ID. */
    readonly id: number
  ) {
    super();

    let loggerPrefix = `gluenet:client#${id}`;
    this.log = debug(loggerPrefix);
    this.logPacket = debug(`${loggerPrefix}:packets`);

    ws.on('message', (packet: Buffer) => this.handlePacket(packet));

    ws.on('close', () => {
      for (let device of this.devices) this.emit('deviceRemoved', device);
      this.devices.clear();
    });

    this.sendHandshake();
  }

  private sendHandshake(): void {
    this.log(`handshaking with ${this.address}`);
    let packet: Buffer = Buffer.allocUnsafe(2);
    packet.writeUInt8(PacketType.HANDSHAKE, 0);
    packet.writeUInt8(this.id, 1);
    this.send(packet);
  }

  /**
   * Send a packet to remote client.
   */
  send(packet: Buffer): void {
    this.logPacket('<= (%d bytes) %o', packet.byteLength, packet);
    this.ws.send(packet);
  }

  private handlePacket(packet: Buffer): void {
    if (!Buffer.isBuffer(packet)) packet = Buffer.from(packet);
    this.logPacket('=> (%d bytes) %o', packet.byteLength, packet);

    let packetType = packet.readUInt8(0);
    switch (packetType) {
      case PacketType.ADD_DEVICE: {
        let deviceType = packet.readUInt8(1);
        let deviceID = packet.readUInt8(2);
        this.addDevice(deviceType, deviceID);
        break;
      }

      case PacketType.REMOVE_DEVICE: {
        let deviceID = packet.readUInt8(1);
        this.removeDevice(deviceID);
        break;
      }

      case PacketType.EVENT: {
        let deviceID = packet.readUInt8(1);
        let eventID = packet.readUInt8(2);
        let eventData = packet.slice(3);
        let device = this.findDevice(deviceID);
        if (device) device.handleEvent(eventID, eventData);
        break;
      }
    }
  }

  findDevice(id: number): Device | undefined {
    for (let device of this.devices) {
      if (device.id == id) return device;
    }
    return;
  }

  addDevice(type: number, id: number): void {
    // Ensure that we don't have another device with this ID
    if (this.findDevice(id)) return;

    let Constructor = DEVICE_TYPES[type];
    if (isFunction(Constructor)) {
      let device = new Constructor(this, id);
      this.devices.add(device);
      this.emit('deviceAdded', device);
    }
  }

  removeDevice(id: number): void {
    let device = this.findDevice(id);
    if (device) {
      this.devices.delete(device);
      this.emit('deviceRemoved', device);
    }
  }

  /**
   * Emitted when a new device is added.
   * @event deviceAdded
   */
  on(event: 'deviceAdded', listener: (client: Client) => void): this;
  /**
   * Emitted when a device is removed.
   * @event deviceRemoved
   */
  on(event: 'deviceRemoved', listener: (error: Error) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  addListener(event: 'deviceAdded', listener: (client: Client) => void): this;
  addListener(event: 'deviceRemoved', listener: (error: Error) => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;
  addListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this {
    return super.on(event, listener);
  }
}

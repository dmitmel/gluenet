import { IncomingMessage as HttpRequest } from 'http';

import * as debug from 'debug';
import { isFunction } from 'lodash';
import { EventEmitter } from 'events';
import * as WebSocket from 'ws';
import { getClientIp } from 'request-ip';

import { Client } from './client';

const log = debug('gluenet:server');

const WS_STATUS_CODES: { [code: number]: string } = {
  1000: 'Normal',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Unsupported',
  1005: 'No Status',
  1006: 'Abnormal',
  1007: 'Unsupported Data',
  1008: 'Policy Violation',
  1009: 'Too Large',
  1010: 'Missing Extension',
  1011: 'Internal Error',
  1012: 'Service Restart',
  1013: 'Try Again Later',
  1015: 'TLS Handshake'
};

/**
 * The maximum number of clients that can be connected to a server at the same
 * time. Limited to `256` because client IDs in the binary protocol have size
 * of 1 byte.
 * @const
 */
export const MAX_CLIENTS_COUNT: number = 256;

/**
 * This class is used to create a
 * [`WebSocket.Server`](https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocketserver)
 * that listens for connections from {@linkcode Client}s and communicates with
 * them via [**The Binary Protocol**](../modules/_gluenet_packet_.html#the-binary-protocol).
 */
export class Server extends EventEmitter {
  /** An array of connected clients. */
  readonly clients: Set<Client> = new Set();

  /** An underlying server. */
  readonly wsServer: WebSocket.Server;

  /**
   * Creates a new server, starts it up and calls the callback when a server
   * is bound.
   */
  constructor(options: WebSocket.IServerOptions, callback?: () => void) {
    super();

    log('Starting up a server on port %d...', options.port);

    this.wsServer = new WebSocket.Server(options);

    this.wsServer.on('listening', () => {
      log(
        `GlueNet server is available on ws://${options.host}:${options.port}/`
      );
      if (isFunction(callback)) callback();
      this.emit('listening');
    });

    this.wsServer.on('connection', (ws, req) => this.handleConnection(ws, req));
  }

  private handleConnection(ws: WebSocket, req: HttpRequest): void {
    let address: string = getClientIp(req);
    log('got connection from %s', address);
    ws.on('close', (code: number, reason: string) => {
      reason = reason || WS_STATUS_CODES[code] || 'Closed';
      log('closed connection with %s: %d %s', address, code, reason);
    });

    if (this.clients.size >= MAX_CLIENTS_COUNT) {
      ws.close(4000, 'Too Many Clients');
    } else {
      let client = new Client(ws, address, this.getNextClientID());

      this.clients.add(client);
      client.ws.on('close', () => {
        for (let otherClient of this.clients) {
          if (otherClient.id == client.id) {
            this.clients.delete(otherClient);
            return;
          }
        }
      });

      this.emit('connection', client);
    }
  }

  private getNextClientID(): number {
    let existingIDs = new Set<number>();
    for (let client of this.clients) existingIDs.add(client.id);

    let id = 0;
    for (; existingIDs.has(id); id++);
    return id;
  }

  /**
   * Close the server and terminate all clients, calls callback when done.
   */
  close(callback?: (err: any) => void): void {
    this.wsServer.close(callback);
    this.clients.clear();
  }

  /**
   * Emitted when the handshake is complete.
   * @event connection
   */
  on(event: 'connection', listener: (client: Client) => void): this;
  /**
   * Emitted when an error occurs on the underlying server.
   * @event error
   */
  on(event: 'error', listener: (error: Error) => void): this;
  /**
   * Emitted when the underlying server has been bound.
   * @event listening
   */
  on(event: 'listening', listener: () => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  addListener(event: 'connection', listener: (client: Client) => void): this;
  addListener(event: 'error', listener: (error: Error) => void): this;
  addListener(event: 'listening', listener: () => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;
  addListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this {
    return super.on(event, listener);
  }
}

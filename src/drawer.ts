import { Server } from './gluenet/server';
import { Client } from './gluenet/client';
import { Device } from './gluenet/device';
import { Display } from './gluenet/device/display';
import { Mouse, PressEvent as MousePressEvent } from './gluenet/device/mouse';
import { Point, line } from './gluenet/graphics';

const server = new Server({ host: '0.0.0.0', port: 8080 });
const displays = new Set<Display>();

server.on('connection', (client: Client) => {
  client.on('deviceAdded', (device: Device) => {
    if (device instanceof Display) displays.add(device);
    else if (device instanceof Mouse) device.on('down', onClick);
  });

  client.on('deviceRemoved', (device: Device) => {
    if (device instanceof Display) displays.delete(device);
    else if (device instanceof Mouse) device.removeAllListeners('down');
  });
});

let start: Point = { x: 0, y: 0 };

function onClick(event: MousePressEvent): void {
  let point = { x: event.x, y: event.y };
  let points = line(start, point);
  start = point;

  for (let display of displays) {
    for (let point of points) display.write(point.x, point.y, '#');
  }
}

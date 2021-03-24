import { Server } from './gluenet/server';
import { Client } from './gluenet/client';
import { Device } from './gluenet/device';
import { Display } from './gluenet/device/display';
import { Keyboard, KeyboardEvent } from './gluenet/device/keyboard';

const server = new Server({ host: '0.0.0.0', port: 8080 });

let displays: Display[] = [];

function write(x: number, y: number, str: string): void {
    for (let display of displays) display.write(x, y, str);
}

class Cursor {
    x: number = 0;
    y: number = 0;
    visible: boolean = false;

    blinkTimer: NodeJS.Timer;

    constructor(readonly text: TextArea) {}

    moveBy(x: number, y: number): void {
        this.moveTo(this.x + x, this.y + y);
    }

    moveTo(x: number, y: number): void {
        if (x < 0) x = 0;
        if (y < 0) y = 0;

        let lines = text.lines;
        if (y >= lines.length) y = lines.length - 1;
        let line = lines[y];
        if (x >= line.length) x = line.length;

        if (!(this.x == x && this.y == y)) {
            write(this.x, this.y, this.text.currentChar);
            this.x = x;
            this.y = y;
        }

        text.cursor.startBlinking();
    }

    startBlinking(): void {
        clearInterval(this.blinkTimer);

        this.visible = true;
        write(this.x, this.y, '_');

        this.blinkTimer = setInterval(() => {
            this.visible = !this.visible;
            write(this.x, this.y, this.visible ? '_' : this.text.currentChar);
        }, 250);
    }
}

class TextArea {
    lines: string[][] = [[]];
    cursor: Cursor = new Cursor(this);

    get currentChar(): string {
        let line = this.lines[this.cursor.y];
        return line[this.cursor.x] || ' ';
    }

    insert(str: string): void {
        let cx = this.cursor.x,
            cy = this.cursor.y;

        let line = this.lines[cy],
            prevLineLength = line.length;
        line.splice(cx, 0, ...str.split(''));

        for (let display of displays) {
            display.move(cx, cy, prevLineLength - cx, 1, str.length, 0);
            display.write(cx, cy, str);
        }

        text.cursor.moveBy(1, 0);
    }

    insertNewLine(): void {
        let cx = this.cursor.x,
            cy = this.cursor.y,
            ny = cy + 1;

        let currentLine = this.lines[cy],
            newLine = currentLine.splice(cx, currentLine.length - cx);
        this.lines.splice(ny, 0, newLine);

        for (let display of displays) {
            // Clear everything after the cursor in the current line
            display.fill(cx, cy, newLine.length, 1, ' ');
            // Shift all lines after the current one by 1 down
            display.move(0, ny, display.width, this.lines.length - ny, 0, 1);
            // Clear the new line
            display.fillLine(ny, ' ');
            // Show the new line
            display.write(0, ny, this.lines[ny].join(''));
        }

        this.cursor.moveTo(0, ny);
    }

    deletePrecedingChar(count: number): void {
        text.cursor.moveBy(-count, 0);
        this.deleteChar();
    }

    deleteChar(): void {
        let cx = this.cursor.x,
            cy = this.cursor.y;

        let line = this.lines[this.cursor.y],
            prevLineLength = line.length;
        line.splice(this.cursor.x, 1);

        for (let display of displays) {
            display.copy(cx + 1, cy, prevLineLength - cx - 1, 1, cx, cy);
        }

        this.renderLine(this.cursor.y);
        this.cursor.startBlinking();
    }

    renderLine(lineN: number): void {
        for (let display of displays) {
            display.fillLine(lineN, ' ');
            display.write(0, lineN, this.lines[lineN].join(''));
        }
    }
}

let text = new TextArea();
text.cursor.startBlinking();

server.on('connection', (client: Client) => {
    client.on('deviceAdded', (device: Device) => {
        if (device instanceof Display) onDisplayAdded(device);
        else if (device instanceof Keyboard) onInputAdded(device);
    });
});

function onDisplayAdded(display: Display): void {
    displays.push(display);

    display.on('resize', () => {
        text.lines.forEach((line, i) => display.write(0, i, line.join('')));
    });
}

function onInputAdded(input: Keyboard): void {
    input.on('keydown', (event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp':
                text.cursor.moveBy(0, -1);
                break;
            case 'ArrowRight':
                text.cursor.moveBy(1, 0);
                break;
            case 'ArrowDown':
                text.cursor.moveBy(0, 1);
                break;
            case 'ArrowLeft':
                text.cursor.moveBy(-1, 0);
                break;

            case 'Backspace':
                text.cursor.moveBy(-1, 0);
            case 'Delete':
                text.deleteChar();
                break;

            case 'Enter':
                text.insertNewLine();
                break;
        }
    });

    input.on('keydown', (event: KeyboardEvent) => {
        if (event.key.length == 1) text.insert(event.key);
    });
}

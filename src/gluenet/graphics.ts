/**
 * This module is a simple Graphics Library (GL).
 *
 * <big>
 * **All numbers (including coordinates of points) passed to this GL are
 * rounded using `Math.round`!**
 * </big>
 */

/** An interface for representing points. */
export interface Point {
  /** An `x` coordinate of point (from left to right). */
  x: number;
  /** An `y` coordinate of point (from top to bottom). */
  y: number;
}

/**
 * Converts coordinates of `point` to integers using `Math.round`.
 */
function roundPoint(point: Point): Point {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
}

/**
 * Create a line from `start` to `end` using the
 * [Bresenham's line algorithm](https://wikipedia.org/wiki/Bresenham%27s_line_algorithm).
 * @returns points of the created line
 */
export function line(start: Point, end: Point): Point[] {
  start = roundPoint(start);
  end = roundPoint(end);

  let dx = Math.abs(end.x - start.x);
  let dy = Math.abs(end.y - start.y);
  let sx = start.x < end.x ? 1 : -1;
  let sy = start.y < end.y ? 1 : -1;
  let err = dx - dy;

  let points = [{ x: start.x, y: start.y }];

  while (!(start.x === end.x && start.y === end.y)) {
    let err2 = err * 2;

    if (err2 > -dy) {
      err -= dy;
      start.x += sx;
    }

    if (err2 < dx) {
      err += dx;
      start.y += sy;
    }

    points.push({ x: start.x, y: start.y });
  }

  return points;
}

/**
 * Create a circle at `center` with the given `radius` using the
 * [Midpoint circle algorithm](https://wikipedia.org/wiki/Midpoint_circle_algorithm).
 * @returns points of the created circle
 */
export function circle(center: Point, radius: number): Point[] {
  center = roundPoint(center);
  radius = Math.round(radius);

  let pixels = [];

  let x = radius - 1;
  let y = 0;
  let dx = 1;
  let dy = 1;
  let err = dx - radius * 2;

  while (x >= y) {
    pixels.push({ x: center.x + x, y: center.y + y });
    pixels.push({ x: center.x + y, y: center.y + x });
    pixels.push({ x: center.x - y, y: center.y + x });
    pixels.push({ x: center.x - x, y: center.y + y });
    pixels.push({ x: center.x - x, y: center.y - y });
    pixels.push({ x: center.x - y, y: center.y - x });
    pixels.push({ x: center.x + y, y: center.y - x });
    pixels.push({ x: center.x + x, y: center.y - y });

    if (err <= 0) {
      y++;
      err += dy;
      dy += 2;
    }
    if (err > 0) {
      x--;
      dx += 2;
      err += (-radius << 1) + dx;
    }
  }

  return pixels;
}

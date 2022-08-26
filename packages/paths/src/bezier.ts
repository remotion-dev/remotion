import type { Properties, Point } from "./types";

import {
  cubicPoint,
  getCubicArcLength,
  cubicDerivative,
  getQuadraticArcLength,
  quadraticPoint,
  quadraticDerivative,
  t2length
} from "./bezier-functions";

export class Bezier implements Properties {
  private a: Point;
  private b: Point;
  private c: Point;
  private d: Point;
  private length: number;
  private getArcLength: (xs: number[], ys: number[], t: number) => number;
  private getPoint: (xs: number[], ys: number[], t: number) => Point;
  private getDerivative: (xs: number[], ys: number[], t: number) => Point;
  constructor(
    ax: number,
    ay: number,
    bx: number,
    by: number,
    cx: number,
    cy: number,
    dx: number | undefined,
    dy: number | undefined
  ) {
    this.a = { x: ax, y: ay };
    this.b = { x: bx, y: by };
    this.c = { x: cx, y: cy };

    if (dx !== undefined && dy !== undefined) {
      this.getArcLength = getCubicArcLength;
      this.getPoint = cubicPoint;
      this.getDerivative = cubicDerivative;
      this.d = { x: dx, y: dy };
    } else {
      this.getArcLength = getQuadraticArcLength;
      this.getPoint = quadraticPoint;
      this.getDerivative = quadraticDerivative;
      this.d = { x: 0, y: 0 };
    }

    this.length = this.getArcLength(
      [this.a.x, this.b.x, this.c.x, this.d.x],
      [this.a.y, this.b.y, this.c.y, this.d.y],
      1
    );
  }

  public getTotalLength = () => {
    return this.length;
  };

  public getPointAtLength = (length: number) => {
    const xs = [this.a.x, this.b.x, this.c.x, this.d.x];
    const xy = [this.a.y, this.b.y, this.c.y, this.d.y];
    const t = t2length(length, this.length, i => this.getArcLength(xs, xy, i));

    return this.getPoint(xs, xy, t);
  };

  public getTangentAtLength = (length: number) => {
    const xs = [this.a.x, this.b.x, this.c.x, this.d.x];
    const xy = [this.a.y, this.b.y, this.c.y, this.d.y];
    const t = t2length(length, this.length, i => this.getArcLength(xs, xy, i));

    const derivative = this.getDerivative(xs, xy, t);
    const mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
    let tangent: Point;
    if (mdl > 0) {
      tangent = { x: derivative.x / mdl, y: derivative.y / mdl };
    } else {
      tangent = { x: 0, y: 0 };
    }

    return tangent;
  };

  public getPropertiesAtLength = (length: number) => {
    const xs = [this.a.x, this.b.x, this.c.x, this.d.x];
    const xy = [this.a.y, this.b.y, this.c.y, this.d.y];
    const t = t2length(length, this.length, i => this.getArcLength(xs, xy, i));

    const derivative = this.getDerivative(xs, xy, t);
    const mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
    let tangent: Point;
    if (mdl > 0) {
      tangent = { x: derivative.x / mdl, y: derivative.y / mdl };
    } else {
      tangent = { x: 0, y: 0 };
    }

    const point = this.getPoint(xs, xy, t);
    return { x: point.x, y: point.y, tangentX: tangent.x, tangentY: tangent.y };
  };

  public getC = () => {
    return this.c;
  };

  public getD = () => {
    return this.d;
  };
}

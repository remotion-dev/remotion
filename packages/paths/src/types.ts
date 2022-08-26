export interface Properties {
  getTotalLength(): number;
  getPointAtLength(pos: number): Point;
  getTangentAtLength(pos: number): Point;
  getPropertiesAtLength(pos: number): PointProperties;
}

export interface PartProperties {
  start: Point;
  end: Point;
  length: number;
  getPointAtLength(pos: number): Point;
  getTangentAtLength(pos: number): Point;
  getPropertiesAtLength(pos: number): PointProperties;
}
export interface Point {
  x: number;
  y: number;
}
export type PointArray = [number, number];

export interface PointProperties {
  x: number;
  y: number;
  tangentX: number;
  tangentY: number;
}

export type pathOrders =
  | "a"
  | "c"
  | "h"
  | "l"
  | "m"
  | "q"
  | "s"
  | "t"
  | "v"
  | "z";

import { bearing, point } from "@turf/turf";

export function calculateBearing(
    startCoord: [number, number],
    endCoord: [number, number]
) {
    const start = point([startCoord[0], startCoord[1]]);
    const end = point([endCoord[0], endCoord[1]]);
    return bearing(start, end);
}

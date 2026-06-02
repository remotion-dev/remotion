import { MyRoute, Point } from "../parser/data";

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

function interpolateSpeed(speed1: number, speed2: number, ratio: number) {
    const interpolatedSpeed = speed1 + (speed2 - speed1) * ratio;
    return interpolatedSpeed ? interpolatedSpeed : 0;
}
// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
const speedBetweenTwoPoints = ({
    lat1,
    lon1,
    lat2,
    lon2,
    t1,
    t2,
}: {
    lat1: number;
    lon1: number;
    lat2: number;
    lon2: number;
    t1: number;
    t2: number;
}): number => {
    const radius = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = radius * c;
    const deltaTime = (t2 - t1) / 1000; // In seconds
    // (distance * 1000 = distance in meters /deltaTime in seconds) = m/s * 3.6 = km/h
    const speed = ((distance * 1000) / deltaTime) * 3.6; // Speed between two points
    return speed;
};

// Used to get the interpolated point at the current frame
export function getCurrentPoint(
    currentTime: number,
    parsedGpxFile: MyRoute
): Point {
    if (parsedGpxFile[0] === undefined) {
        throw new Error("parsedGpxFile is undefined!");
    }

    const startTime = parsedGpxFile[0].time;
    if (startTime === null) {
        throw new Error("Cannot determine start time");
    }

    const currentTimeInUnix = startTime + currentTime * 1000;
    const indexOfPointAfter = parsedGpxFile.findIndex(
        (element) => element.time && element.time > currentTimeInUnix
    );

    const pointAfter = parsedGpxFile[indexOfPointAfter];
    const pointAfterPlusOne =
        parsedGpxFile[indexOfPointAfter + 1] ?? pointAfter;

    const pointBefore = parsedGpxFile[Math.max(indexOfPointAfter - 1, 0)]; // Makes sure index is at least 0 --> no index out of bound

    if (pointAfter.time === null) {
        throw new Error("dont have time");
    }
    if (pointBefore.time === null) {
        throw new Error("dont have time");
    }
    if (pointAfterPlusOne.time === null) {
        throw new Error("dont have time");
    }

    const timeDiff = pointAfter.time - pointBefore.time;

    const timeSincePrevPoint = currentTimeInUnix - pointBefore.time;
    const ratio = timeDiff > 0 ? timeSincePrevPoint / timeDiff : 0;

    const newPointLat =
        pointBefore.latitude +
        (pointAfter.latitude - pointBefore.latitude) * ratio;
    const newPointLon =
        pointBefore.longitude +
        (pointAfter.longitude - pointBefore.longitude) * ratio;

    const speed1 = speedBetweenTwoPoints({
        lat1: pointBefore.latitude,
        lon1: pointBefore.longitude,
        lat2: pointAfter.latitude,
        lon2: pointAfter.longitude,
        t1: pointBefore.time,
        t2: pointAfter.time,
    });
    const speed2 = speedBetweenTwoPoints({
        lat1: pointAfter.latitude,
        lon1: pointAfter.longitude,
        lat2: pointAfterPlusOne.latitude,
        lon2: pointAfterPlusOne.longitude,
        t1: pointAfter.time,
        t2: pointAfterPlusOne.time,
    });

    const newPoint: Point = {
        // If pointBefore.ele or pointAfter.ele === null, ele of new point should be null
        latitude: newPointLat,
        longitude: newPointLon,
        time: currentTimeInUnix, //
        elevation:
            pointBefore.elevation === null || pointAfter.elevation === null
                ? null
                : pointBefore.elevation +
                  (pointAfter.elevation - pointBefore.elevation) * ratio,

        // If speed data exists, interpolate it, else calculate speed based on lat and lon
        speed: interpolateSpeed(speed1, speed2, ratio),
        // If hr data exists, interpolate it, else hr = null
        heartrate:
            pointBefore.heartrate !== null && pointAfter.heartrate !== null
                ? pointBefore.heartrate +
                  (pointAfter.heartrate - pointBefore.heartrate) * ratio
                : null,
        poi: pointBefore.poi,
    };
    return newPoint;
}

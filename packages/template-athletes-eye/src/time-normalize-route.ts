import { interpolate } from "remotion";
import { MyRoute, Point } from "../parser/data";

export const SAMPLES_PER_SECOND = 30;

export const timeNormalizeRoute = (
    route: MyRoute,
    videoDurationInFrames: number,
    fps: number
) => {
    const lastPoint = route[route.length - 1];
    if (lastPoint.time === null) {
        throw new Error("time is null");
    }
    const lastTime = lastPoint.time;

    const firstPoint = route[0];
    if (firstPoint.time === null) {
        throw new Error("time is null");
    }
    const firstTime = firstPoint.time;

    const timeInMilliseconds = lastTime - firstTime;

    const videoDurationInMilliseconds = (videoDurationInFrames / fps) * 1000;
    const speed = timeInMilliseconds / videoDurationInMilliseconds;
    const samples = Math.round(
        (timeInMilliseconds * SAMPLES_PER_SECOND) / 1000 / speed
    );
    const points: Point[] = [];

    for (let i = 0; i < samples; i++) {
        const time = firstTime + (i / samples) * timeInMilliseconds;
        // @ts-expect-error not in types
        const pointBeforeIndex = route.findLastIndex(
            (p: Point) => p.time && p.time < time
        ) as number;
        const pointAfterIndex = route.findIndex(
            (p) => p.time && p.time > time
        ) as number;

        const pointBefore =
            pointBeforeIndex === -1 ? route[0] : route[pointBeforeIndex];
        const pointAfter =
            pointAfterIndex === -1
                ? route[route.length - 1]
                : route[pointAfterIndex];

        if (pointBefore.time === null || pointAfter.time === null) {
            throw new Error("time is null");
        }

        const interpolationRatio =
            (time - pointBefore.time) / (pointAfter.time - pointBefore.time);

        const newPointLat = interpolate(
            interpolationRatio,
            [0, 1],
            [pointBefore.latitude, pointAfter.latitude]
        );
        const newPointLon = interpolate(
            interpolationRatio,
            [0, 1],
            [pointBefore.longitude, pointAfter.longitude]
        );
        const newPointEle = interpolate(
            interpolationRatio,
            [0, 1],
            [pointBefore.elevation ?? 0, pointAfter.elevation ?? 0]
        );
        const newPointHeartrate = interpolate(
            interpolationRatio,
            [0, 1],
            [pointBefore.heartrate ?? 0, pointAfter.heartrate ?? 0]
        );
        const newPointSpeed = interpolate(
            interpolationRatio,
            [0, 1],
            [pointBefore.speed ?? 0, pointAfter.speed ?? 0]
        );
        const newPoint: Point = {
            // If pointBefore.ele or pointAfter.ele === null, ele of new point should be null
            latitude: newPointLat,
            longitude: newPointLon,
            time,
            elevation: newPointEle,
            heartrate: newPointHeartrate,
            speed: newPointSpeed,
            poi: pointBefore.poi,
        };
        points.push(newPoint);
    }

    return points;
};

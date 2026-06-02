import { Point } from "../parser/data";
import { distanceBetweenPoints } from "./smoothen-points";

export const findFuturePointWithMinimumDistancePassedSinceThen = ({
    currentPoint,
    targetRoute,
    index,
    minimumDistanceInKm,
}: {
    currentPoint: Point;
    targetRoute: Point[];
    index: number;
    minimumDistanceInKm: number;
}) => {
    const onlyFuturePoints = targetRoute.slice(index);

    return (
        onlyFuturePoints.find((_, i) => {
            const pointsInbetween = onlyFuturePoints.slice(0, i + 1);
            const distances = pointsInbetween.map((p, i) => {
                const dis = distanceBetweenPoints(
                    pointsInbetween[i - 1] ?? currentPoint,
                    p
                );
                return dis;
            });
            return distances.reduce((a, b) => a + b, 0) > minimumDistanceInKm;
        }) ?? targetRoute[targetRoute.length - 1]
    );
};

export const findLastIndexWithMinimumDistancePassedSinceThen = ({
    currentPoint,
    targetRoute,
    minimumDistanceInKm,
    index,
}: {
    currentPoint: Point;
    targetRoute: Point[];
    minimumDistanceInKm: number;
    index: number;
}) => {
    const onlyPreviousPoints = targetRoute.slice(0, index + 1);

    // @ts-expect-error findLastIndex
    const foundIndex = onlyPreviousPoints.findLastIndex((_, i) => {
        const pointsInbetween = onlyPreviousPoints.slice(
            0,
            onlyPreviousPoints.length - i
        );
        const distances = pointsInbetween.map((p, i) => {
            const dis = distanceBetweenPoints(
                pointsInbetween[i - 1] ?? currentPoint,
                p
            );
            return dis;
        });
        return distances.reduce((a, b) => a + b, 0) > minimumDistanceInKm;
    });

    return foundIndex === -1 ? 0 : foundIndex;
};

export const findNextIndexWithMinimumDistancePassedSinceThen = ({
    currentPoint,
    targetRoute,
    minimumDistanceInKm,
    index,
}: {
    currentPoint: Point;
    targetRoute: Point[];
    minimumDistanceInKm: number;
    index: number;
}) => {
    const onlyFuturePoints = targetRoute.slice(index);

    const foundIndex = onlyFuturePoints.findIndex((_, i) => {
        const pointsInbetween = onlyFuturePoints.slice(0, i + 1);
        const distances = pointsInbetween.map((p, i) => {
            const dis = distanceBetweenPoints(
                pointsInbetween[i - 1] ?? currentPoint,
                p
            );
            return dis;
        });
        return distances.reduce((a, b) => a + b, 0) > minimumDistanceInKm;
    });

    return foundIndex === -1 ? targetRoute.length - 1 : foundIndex;
};

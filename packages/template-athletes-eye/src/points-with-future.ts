import { distanceBetweenPoints, type RoutePoint } from "./route-utils";

export const findFuturePointWithMinimumDistancePassedSinceThen = ({
  currentPoint,
  targetRoute,
  index,
  minimumDistanceInKm,
}: {
  currentPoint: RoutePoint;
  targetRoute: RoutePoint[];
  index: number;
  minimumDistanceInKm: number;
}) => {
  const onlyFuturePoints = targetRoute.slice(index);

  return (
    onlyFuturePoints.find((_, pointIndex) => {
      const pointsInBetween = onlyFuturePoints.slice(0, pointIndex + 1);
      const distances = pointsInBetween.map((point, distanceIndex) => {
        return distanceBetweenPoints(
          pointsInBetween[distanceIndex - 1] ?? currentPoint,
          point,
        );
      });

      return (
        distances.reduce((sum, distance) => sum + distance, 0) >
        minimumDistanceInKm
      );
    }) ?? targetRoute[targetRoute.length - 1]
  );
};

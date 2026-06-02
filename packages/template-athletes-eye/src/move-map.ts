import { type GeoJSONSource, type Map, MercatorCoordinate } from "mapbox-gl";
import { calculateBearing } from "./calculate-bearing";
import { MAP_ZOOM } from "./load-map";
import { findFuturePointWithMinimumDistancePassedSinceThen } from "./points-with-future";
import type { RoutePoint } from "./route-utils";

const isGeoJsonSource = (
  source: ReturnType<Map["getSource"]>,
): source is GeoJSONSource => {
  return Boolean(source && "setData" in source);
};

const getRemainingRoute = (targetRoute: RoutePoint[]) => {
  if (targetRoute.length >= 2) {
    return targetRoute;
  }

  return targetRoute.slice(-2);
};

export const moveMapToPoint = ({
  currentPoint,
  map,
  route,
}: {
  currentPoint: RoutePoint | undefined;
  map: Map;
  route: RoutePoint[];
}) => {
  const cameraAltitude = 4000;

  if (!currentPoint) {
    throw new Error("No route point found");
  }

  const targetRoute = [currentPoint, ...route.slice(1)];
  const futurePoint = findFuturePointWithMinimumDistancePassedSinceThen({
    currentPoint,
    index: 0,
    minimumDistanceInKm: 0.025,
    targetRoute,
  });
  const bearing = calculateBearing(
    [currentPoint.longitude, currentPoint.latitude],
    [futurePoint.longitude, futurePoint.latitude],
  );
  const camera = map.getFreeCameraOptions();

  camera.position = MercatorCoordinate.fromLngLat(
    {
      lat: currentPoint.latitude,
      lng: currentPoint.longitude,
    },
    cameraAltitude,
  );

  return new Promise<void>((resolve) => {
    map.once("idle", () => {
      resolve();
    });

    map.setCenter({
      lat: currentPoint.latitude,
      lng: currentPoint.longitude,
    });
    map.setBearing(bearing);

    const point = map.getSource("currentpoint");

    if (isGeoJsonSource(point)) {
      point.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [currentPoint.longitude, currentPoint.latitude],
        },
      });
    }

    const line = map.getSource("trace");

    if (isGeoJsonSource(line)) {
      line.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: getRemainingRoute(targetRoute).map((point) => [
            point.longitude,
            point.latitude,
          ]),
        },
      });
    }

    map.setZoom(MAP_ZOOM);
    map.setPitch(60);
    map.resize();
  });
};

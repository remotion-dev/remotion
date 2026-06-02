import { Map, MercatorCoordinate } from "mapbox-gl";
import { Point } from "../parser/data";
import { calculateBearing } from "./calculate-bearing";
import { MAP_ZOOM } from "./load-map";
import { findFuturePointWithMinimumDistancePassedSinceThen } from "./points-with-future";

export const moveMap = (map: Map, targetRoute: Point[], index: number) => {
    const cameraAltitude = 4000;

    const currentPoint = targetRoute[index];

    const futurePoints = findFuturePointWithMinimumDistancePassedSinceThen({
        currentPoint,
        targetRoute,
        index,
        minimumDistanceInKm: 0.025,
    });
    const bearing = calculateBearing(
        [currentPoint.longitude, currentPoint.latitude],
        [futurePoints.longitude, futurePoints.latitude]
    );

    const camera = map.getFreeCameraOptions();

    // Set the position and altitude of the camera
    camera.position = MercatorCoordinate.fromLngLat(
        {
            lng: currentPoint.longitude,
            lat: currentPoint.latitude,
        },
        cameraAltitude
    );

    map.setCenter({
        lng: currentPoint.longitude,
        lat: currentPoint.latitude,
    });
    map.setBearing(bearing);
    const point = map.getSource("currentpoint");

    if (point.type === "geojson") {
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
    if (line.type === "geojson") {
        line.setData({
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: targetRoute
                    .slice(index)
                    .map((p) => [p.longitude, p.latitude]),
            },
        });
    }

    map.setZoom(MAP_ZOOM);
    map.setPitch(60);

    map.resize();
    return new Promise<void>((resolve) => {
        map.once("idle", () => {
            resolve();
        });
    });
};

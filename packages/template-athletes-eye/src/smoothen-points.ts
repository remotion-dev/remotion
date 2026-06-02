import { MyRoute, Point } from "../parser/data";
import {
    findLastIndexWithMinimumDistancePassedSinceThen,
    findNextIndexWithMinimumDistancePassedSinceThen,
} from "./points-with-future";

export const distanceBetweenPoints = (point1: Point, point2: Point) => {
    const lat1 = point1.latitude;
    const lon1 = point1.longitude;
    const lat2 = point2.latitude;
    const lon2 = point2.longitude;
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

export const smoothenPoints = (route: MyRoute): Point[] => {
    return route.map((point, index) => {
        const lastIndexOutsideRadius =
            findLastIndexWithMinimumDistancePassedSinceThen({
                currentPoint: point,
                targetRoute: route,
                minimumDistanceInKm: 0.05,
                index,
            });
        const firstIndexOutsideRadius =
            findNextIndexWithMinimumDistancePassedSinceThen({
                currentPoint: point,
                targetRoute: route,
                minimumDistanceInKm: 0.05,
                index,
            });

        const points = route
            .slice(lastIndexOutsideRadius, firstIndexOutsideRadius + index)
            .filter((p) => p !== undefined);

        const lats = points.map((p) => p.latitude);
        const lons = points.map((p) => p.longitude);

        const averageLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const averageLon = lons.reduce((a, b) => a + b, 0) / lons.length;

        return {
            latitude: averageLat,
            longitude: averageLon,
            time: point.time,
            elevation: point.elevation,
            speed: point.speed,
            heartrate: point.heartrate,
            poi: point.poi,
        };
    });
};

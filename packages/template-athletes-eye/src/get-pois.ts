import { MyRoute } from "../parser/data";

export type Poi = {
    name: string;
    startFrame: number;
    endFrame: number;
    latitude: number;
    longitude: number;
};

export const getPointsOfInterest = (route: MyRoute) => {
    const pois: Poi[] = [];
    route.forEach((point, i) => {
        const lastPoi = pois[pois.length - 1];
        const poiExists = lastPoi && lastPoi.name === point.poi;

        if (point.poi && !poiExists) {
            pois.push({
                name: point.poi,
                startFrame: i,
                endFrame: i,
                latitude: point.latitude,
                longitude: point.longitude,
            });
        } else {
            const lastPoi = pois[pois.length - 1];
            if (lastPoi) {
                lastPoi.endFrame = i;
            }
        }
    });
    return pois;
};

import mapboxgl, { Map } from "mapbox-gl";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { Point } from "../parser/data";
import { Poi } from "./get-pois";
import { loadMap } from "./load-map";
import { moveMap } from "./move-map";

mapboxgl.accessToken = process.env.REMOTION_MAPBOX_TOKEN as string;

export const MapboxMap: React.FC<{
    targetRoute: Point[];
    index: number;
    pois: Poi[];
}> = ({ targetRoute, index, pois }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [handle] = useState(() => delayRender("Loading map..."));
    const [map, setMap] = useState<Map | null>(null);

    useEffect(() => {
        loadMap(targetRoute, pois).then((_map) => {
            continueRender(handle);
            setMap(_map);
        });
    }, [handle, pois, targetRoute]);

    useLayoutEffect(() => {
        if (!map) {
            return;
        }
        const handle = delayRender("Moving point...");

        moveMap(map, targetRoute, index).then(() => {
            continueRender(handle);
        });
    }, [index, map, targetRoute]);

    return <AbsoluteFill ref={ref} id="map" />;
};

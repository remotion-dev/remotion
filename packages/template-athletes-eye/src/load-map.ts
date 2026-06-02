import { Map } from "mapbox-gl";
import { staticFile } from "remotion";
import { Point } from "../parser/data";
import { Poi } from "./get-pois";
import { mapboxStyle } from "./style";

export const MAP_ZOOM = 17;
export const loadMap = (targetRoute: Point[], pois: Poi[]) => {
    const map = new Map({
        container: "map",
        zoom: MAP_ZOOM,
        center: [targetRoute[0].longitude, targetRoute[0].latitude],
        pitch: 65,
        bearing: -180,
        style: mapboxStyle,
        interactive: false,
        fadeDuration: 0,
    });

    map.loadImage(staticFile("location.png"), (err, image) => {
        if (err) throw err;
        map.addImage("location", image!);
    });
    map.loadImage(staticFile("end.png"), (err, image) => {
        if (err) throw err;
        map.addImage("end", image!);
    });
    map.loadImage(staticFile("poi.png"), (err, image) => {
        if (err) throw err;
        map.addImage("poi", image!);
    });

    map.on("style.load", () => {
        map.addSource("trace", {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: targetRoute.map((p) => [
                        p.longitude,
                        p.latitude,
                    ]),
                },
            },
        });
        map.addSource("currentpoint", {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "Point",
                    coordinates: [
                        targetRoute[0].longitude,
                        targetRoute[0].latitude,
                    ],
                },
            },
        });
        for (const poi of pois) {
            map.addSource(poi.name, {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Point",
                        coordinates: [poi.longitude, poi.latitude],
                    },
                },
            });
        }
        map.addSource("endpoint", {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "Point",
                    coordinates: [
                        targetRoute[targetRoute.length - 1].longitude,
                        targetRoute[targetRoute.length - 1].latitude,
                    ],
                },
            },
        });
        map.addLayer(
            {
                type: "line",
                source: "trace",
                id: "linestroke",
                paint: {
                    "line-color": "#004DE8",
                    "line-width": 30,
                },
                layout: {
                    "line-cap": "round",
                    "line-join": "round",
                },
            },
            "building-extrusion"
        );
        map.addLayer(
            {
                type: "line",
                source: "trace",
                id: "line",
                paint: {
                    "line-color": "#0D96FF",
                    "line-width": 20,
                },
                layout: {
                    "line-cap": "round",
                    "line-join": "round",
                },
            },
            "building-extrusion"
        );

        for (const poi of pois) {
            map.addLayer({
                type: "symbol",
                source: poi.name,
                id: poi.name,
                layout: {
                    "icon-image": "poi",
                    "icon-size": 0.13,
                    "icon-pitch-alignment": "map",
                    "icon-allow-overlap": true,
                },
                paint: {
                    "icon-opacity": 0.7,
                },
            });
        }
        map.addLayer({
            type: "symbol",
            source: "endpoint",
            id: "endpoint",
            layout: {
                "icon-image": "end",
                "icon-size": 0.6,
                "icon-pitch-alignment": "map",
                "icon-allow-overlap": true,
            },
        });
        map.addLayer({
            type: "symbol",
            source: "currentpoint",
            id: "currentpoint",
            layout: {
                "icon-image": "location",
                "icon-size": 0.75,
                "icon-pitch-alignment": "map",
                "icon-allow-overlap": true,
            },
        });

        map.getStyle().layers.forEach((layer) => {
            if (layer.id === "currentpoint") {
                return;
            }
            if (layer.id === "endpoint") {
                return;
            }
            if (layer.id === "line") {
                return;
            }
            if (layer.id === "linestroke") {
                return;
            }
            if (layer.type === "symbol") {
                return;
            }
            if (layer.id === "building-extrusion") {
                map.setPaintProperty(layer.id, `${layer.type}-opacity`, 0.3);

                return;
            }
            map.setPaintProperty(layer.id, `${layer.type}-opacity`, 0.3);
        });
    });

    return new Promise<Map>((resolve) => {
        map.on("load", () => {
            resolve(map);
        });
    });
};

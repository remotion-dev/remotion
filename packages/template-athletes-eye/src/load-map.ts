import mapboxgl, { type Map } from "mapbox-gl";
import { staticFile } from "remotion";
import type { RoutePoint } from "./route-utils";
import { mapboxStyle } from "./style";

export const MAP_ZOOM = 17;

const getMapboxToken = () => {
  const mapboxToken = process.env.REMOTION_MAPBOX_TOKEN;

  if (!mapboxToken) {
    throw new Error(
      "Set REMOTION_MAPBOX_TOKEN to a Mapbox access token before rendering the Athletes Eye template.",
    );
  }

  return mapboxToken;
};

const addImage = (map: Map, name: string, path: string) => {
  return new Promise<void>((resolve, reject) => {
    if (map.hasImage(name)) {
      resolve();
      return;
    }

    map.loadImage(staticFile(path), (err, image) => {
      if (err) {
        reject(err);
        return;
      }

      if (!image) {
        reject(new Error(`Could not load map image "${path}"`));
        return;
      }

      if (!map.hasImage(name)) {
        map.addImage(name, image);
      }

      resolve();
    });
  });
};

const routeToLineString = (route: RoutePoint[]) => {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: route.map((point) => [point.longitude, point.latitude]),
    },
  };
};

const routePointToPoint = (point: RoutePoint) => {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Point" as const,
      coordinates: [point.longitude, point.latitude],
    },
  };
};

export const loadMap = (targetRoute: RoutePoint[], container: HTMLElement) => {
  const firstPoint = targetRoute[0];
  const lastPoint = targetRoute[targetRoute.length - 1];

  if (!firstPoint || !lastPoint) {
    throw new Error("The route needs at least one point to load the map");
  }

  mapboxgl.accessToken = getMapboxToken();

  const map = new mapboxgl.Map({
    bearing: -180,
    center: [firstPoint.longitude, firstPoint.latitude],
    container,
    fadeDuration: 0,
    interactive: false,
    pitch: 65,
    style: mapboxStyle,
    zoom: MAP_ZOOM,
  });

  return new Promise<Map>((resolve, reject) => {
    map.once("load", () => {
      Promise.all([
        addImage(map, "location", "location.png"),
        addImage(map, "end", "end.png"),
        addImage(map, "poi", "poi.png"),
      ])
        .then(() => {
          map.addSource("trace", {
            data: routeToLineString(targetRoute),
            type: "geojson",
          });
          map.addSource("currentpoint", {
            data: routePointToPoint(firstPoint),
            type: "geojson",
          });
          map.addSource("endpoint", {
            data: routePointToPoint(lastPoint),
            type: "geojson",
          });

          const beforeLayerId = map.getLayer("building-extrusion")
            ? "building-extrusion"
            : undefined;

          map.addLayer(
            {
              id: "linestroke",
              layout: {
                "line-cap": "round",
                "line-join": "round",
              },
              paint: {
                "line-color": "#004DE8",
                "line-width": 30,
              },
              source: "trace",
              type: "line",
            },
            beforeLayerId,
          );
          map.addLayer(
            {
              id: "line",
              layout: {
                "line-cap": "round",
                "line-join": "round",
              },
              paint: {
                "line-color": "#0D96FF",
                "line-width": 20,
              },
              source: "trace",
              type: "line",
            },
            beforeLayerId,
          );
          map.addLayer({
            id: "endpoint",
            layout: {
              "icon-allow-overlap": true,
              "icon-image": "end",
              "icon-pitch-alignment": "map",
              "icon-size": 0.6,
            },
            source: "endpoint",
            type: "symbol",
          });
          map.addLayer({
            id: "currentpoint",
            layout: {
              "icon-allow-overlap": true,
              "icon-image": "location",
              "icon-pitch-alignment": "map",
              "icon-size": 0.75,
            },
            source: "currentpoint",
            type: "symbol",
          });

          for (const layer of map.getStyle().layers ?? []) {
            if (
              layer.id === "currentpoint" ||
              layer.id === "endpoint" ||
              layer.id === "line" ||
              layer.id === "linestroke" ||
              layer.type === "symbol"
            ) {
              continue;
            }

            map.setPaintProperty(layer.id, `${layer.type}-opacity`, 0.3);
          }
          resolve(map);
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  });
};

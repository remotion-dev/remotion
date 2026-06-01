import type { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useLayoutEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { loadMap } from "./load-map";
import { moveMap } from "./move-map";
import type { RoutePoint } from "./route-utils";

const toError = (err: unknown) => {
  return err instanceof Error ? err : new Error(String(err));
};

export const RouteMap: React.FC<{
  route: RoutePoint[];
  index: number;
}> = ({ route, index }) => {
  const [handle] = useState(() => delayRender("Loading map..."));
  const [map, setMap] = useState<Map | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let loadedMap: Map | null = null;

    try {
      loadMap(route)
        .then((_map) => {
          loadedMap = _map;
          continueRender(handle);

          if (isMounted) {
            setMap(_map);
          } else {
            _map.remove();
          }
        })
        .catch((err: unknown) => {
          continueRender(handle);

          if (isMounted) {
            setError(toError(err));
          }
        });
    } catch (err) {
      continueRender(handle);

      if (isMounted) {
        setError(toError(err));
      }
    }

    return () => {
      isMounted = false;
      loadedMap?.remove();
    };
  }, [handle, route]);

  useLayoutEffect(() => {
    if (!map) {
      return;
    }

    const moveHandle = delayRender("Moving point...");

    try {
      moveMap(map, route, index)
        .then(() => {
          continueRender(moveHandle);
        })
        .catch((err: unknown) => {
          continueRender(moveHandle);
          setError(toError(err));
        });
    } catch (err) {
      continueRender(moveHandle);
      setError(toError(err));
    }
  }, [index, map, route]);

  if (error) {
    throw error;
  }

  return <AbsoluteFill id="map" />;
};

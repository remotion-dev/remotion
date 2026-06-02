import type { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { loadMap } from "./load-map";
import { moveMapToPoint } from "./move-map";
import type { RoutePoint } from "./route-utils";

const toError = (err: unknown) => {
  return err instanceof Error ? err : new Error(String(err));
};

export const RouteMap: React.FC<{
  currentPoint: RoutePoint;
  remainingRoute: RoutePoint[];
}> = ({ currentPoint, remainingRoute }) => {
  const [handle] = useState(() => delayRender("Loading map..."));
  const [initialRoute] = useState(() => remainingRoute);
  const [map, setMap] = useState<Map | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let loadedMap: Map | null = null;
    const container = mapContainer.current;

    if (!container) {
      continueRender(handle);
      setError(new Error("Could not find map container"));
      return;
    }

    try {
      loadMap(initialRoute, container)
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
  }, [handle, initialRoute]);

  useLayoutEffect(() => {
    if (!map) {
      return;
    }

    const moveHandle = delayRender("Moving point...");

    try {
      moveMapToPoint({
        currentPoint,
        map,
        route: remainingRoute,
      })
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
  }, [currentPoint, map, remainingRoute]);

  if (error) {
    throw error;
  }

  return (
    <AbsoluteFill>
      <div
        ref={mapContainer}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </AbsoluteFill>
  );
};

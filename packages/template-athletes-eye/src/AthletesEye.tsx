import { useEffect, useMemo, useState } from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { RouteMap } from "./RouteMap";
import { getRouteProgress, parseGpx, type RoutePoint } from "./route-utils";

export const athletesEyeSchema = z.object({
  videoSrc: z.string(),
  gpxSrc: z.string(),
  accentColor: z.string(),
  durationInSeconds: z.number().positive().optional(),
});

export type AthletesEyeProps = z.infer<typeof athletesEyeSchema>;

const useGpxRoute = (gpxSrc: string) => {
  const [route, setRoute] = useState<RoutePoint[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [handle] = useState(() => delayRender("Loading GPX route"));

  useEffect(() => {
    fetch(gpxSrc)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load GPX file: ${response.status}`);
        }

        return response.text();
      })
      .then((contents) => {
        setRoute(parseGpx(contents));
        continueRender(handle);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        setError(
          new Error(`Could not load GPX file from "${gpxSrc}": ${message}`),
        );
        continueRender(handle);
      });
  }, [gpxSrc, handle]);

  if (error) {
    throw error;
  }

  return route;
};

const statStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const labelStyle: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.72)",
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const valueStyle: React.CSSProperties = {
  color: "white",
  fontSize: 44,
  fontVariantNumeric: "tabular-nums",
  fontWeight: 800,
  letterSpacing: "-0.03em",
};

const Stat: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <div style={statStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
};

export const AthletesEye: React.FC<AthletesEyeProps> = ({
  videoSrc,
  gpxSrc,
}) => {
  const route = useGpxRoute(gpxSrc);
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(
    frame,
    [0, Math.max(1, durationInFrames - 1)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const routeProgress = useMemo(() => {
    return route ? getRouteProgress(route, progress) : null;
  }, [progress, route]);

  if (!route || !routeProgress) {
    return null;
  }

  const speed =
    routeProgress.speedInKmh === null
      ? "--"
      : Math.round(routeProgress.speedInKmh);
  const elevation =
    routeProgress.currentPoint.elevation === null
      ? "--"
      : Math.round(routeProgress.currentPoint.elevation);
  const currentTime =
    routeProgress.currentPoint.time === null
      ? "--"
      : new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "numeric",
        }).format(new Date(routeProgress.currentPoint.time));
  const opacity = interpolate(
    frame,
    [0, 30, Math.max(31, durationInFrames - 30), durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0c1018",
        fontFamily: "Arial",
        opacity,
      }}
    >
      <AbsoluteFill
        style={{
          height: "60%",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Video
          muted
          objectFit="cover"
          src={videoSrc}
          style={{
            height: "100%",
            width: "100%",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          height: "60%",
          overflow: "hidden",
          top: "60%",
        }}
      >
        <RouteMap
          currentPoint={routeProgress.currentPoint}
          key={gpxSrc}
          remainingRoute={routeProgress.remainingRoute}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0) 38%)",
          top: "60%",
        }}
      />
      <AbsoluteFill style={{ top: "60%" }}>
        <div
          style={{
            alignItems: "flex-start",
            color: "white",
            display: "flex",
            flexDirection: "row",
            fontVariantNumeric: "tabular-nums",
            padding: 50,
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              letterSpacing: "-0.06em",
              lineHeight: 1,
            }}
          >
            {speed}km/h
          </div>
          <div
            style={{
              flex: 1,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              textAlign: "right",
            }}
          >
            <Stat label="Time" value={currentTime} />
            <Stat
              label="Distance"
              value={`${routeProgress.distanceInKm.toFixed(2)}km`}
            />
            <Stat label="Elevation" value={`${elevation} m`} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

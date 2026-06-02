export type RoutePoint = {
  latitude: number;
  longitude: number;
  elevation: number | null;
  time: number | null;
};

export type RouteStats = {
  distanceInKm: number;
  elevationGainInMeters: number;
};

const toNumber = (value: string | null) => {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getChildText = (element: Element, tagName: string) => {
  for (const child of Array.from(element.children)) {
    if (child.localName === tagName) {
      return child.textContent;
    }
  }

  return null;
};

export const parseGpx = (xml: string): RoutePoint[] => {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const parserError = document.getElementsByTagName("parsererror")[0];

  if (parserError) {
    throw new Error(parserError.textContent ?? "Could not parse GPX file");
  }

  const trackPoints = Array.from(document.getElementsByTagName("trkpt"));
  const points = trackPoints.map((point) => {
    const latitude = toNumber(point.getAttribute("lat"));
    const longitude = toNumber(point.getAttribute("lon"));
    const elevation = toNumber(getChildText(point, "ele"));
    const timeText = getChildText(point, "time");
    const time = timeText ? new Date(timeText).getTime() : null;

    if (latitude === null || longitude === null) {
      throw new Error("Every GPX track point needs latitude and longitude");
    }

    return {
      latitude,
      longitude,
      elevation,
      time: Number.isFinite(time) ? time : null,
    };
  });

  if (points.length < 2) {
    throw new Error("The GPX file needs at least two track points");
  }

  return points;
};

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const distanceBetweenPoints = (from: RoutePoint, to: RoutePoint) => {
  const earthRadiusInKm = 6371;
  const latDistance = degreesToRadians(to.latitude - from.latitude);
  const lonDistance = degreesToRadians(to.longitude - from.longitude);
  const fromLat = degreesToRadians(from.latitude);
  const toLat = degreesToRadians(to.latitude);

  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(lonDistance / 2) *
      Math.sin(lonDistance / 2);

  return earthRadiusInKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getRouteStats = (route: RoutePoint[]): RouteStats => {
  return route.reduce<RouteStats>(
    (stats, point, index) => {
      const previous = route[index - 1];
      if (!previous) {
        return stats;
      }

      const elevationDelta =
        point.elevation === null || previous.elevation === null
          ? 0
          : Math.max(0, point.elevation - previous.elevation);

      return {
        distanceInKm:
          stats.distanceInKm + distanceBetweenPoints(previous, point),
        elevationGainInMeters: stats.elevationGainInMeters + elevationDelta,
      };
    },
    {
      distanceInKm: 0,
      elevationGainInMeters: 0,
    },
  );
};

export const getRouteProgress = (route: RoutePoint[], progress: number) => {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const routeIndex = clampedProgress * (route.length - 1);
  const startIndex = Math.floor(routeIndex);
  const endIndex = Math.min(route.length - 1, startIndex + 1);
  const segmentProgress = routeIndex - startIndex;
  const start = route[startIndex];
  const end = route[endIndex];

  if (!start || !end) {
    throw new Error("Could not calculate route progress");
  }

  const currentPoint = {
    latitude:
      start.latitude + (end.latitude - start.latitude) * segmentProgress,
    longitude:
      start.longitude + (end.longitude - start.longitude) * segmentProgress,
    elevation:
      start.elevation === null || end.elevation === null
        ? null
        : start.elevation + (end.elevation - start.elevation) * segmentProgress,
    time:
      start.time === null || end.time === null
        ? null
        : start.time + (end.time - start.time) * segmentProgress,
  };

  const completedRoute = [...route.slice(0, startIndex + 1), currentPoint];
  const remainingRoute = [currentPoint, ...route.slice(endIndex)];
  const completedStats = getRouteStats(completedRoute);
  const seconds =
    start.time === null || end.time === null
      ? null
      : Math.max(1, (end.time - start.time) / 1000);
  const speedInKmh =
    seconds === null
      ? null
      : (distanceBetweenPoints(start, end) / seconds) * 3600;

  return {
    completedRoute,
    currentPoint,
    distanceInKm: completedStats.distanceInKm,
    remainingRoute,
    speedInKmh,
  };
};

import { useTimelinePosition } from "./timeline-position-state";

export const useFrame = () => {
  const [timelinePosition] = useTimelinePosition();

  const param = new URLSearchParams(window.location.search).get("frame");
  if (param !== null) {
    return param;
  }
  return timelinePosition;
};

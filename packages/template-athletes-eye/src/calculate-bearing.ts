const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;
const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

export const calculateBearing = (
  startCoord: [number, number],
  endCoord: [number, number],
) => {
  const startLatitude = degreesToRadians(startCoord[1]);
  const endLatitude = degreesToRadians(endCoord[1]);
  const longitudeDelta = degreesToRadians(endCoord[0] - startCoord[0]);

  const y = Math.sin(longitudeDelta) * Math.cos(endLatitude);
  const x =
    Math.cos(startLatitude) * Math.sin(endLatitude) -
    Math.sin(startLatitude) * Math.cos(endLatitude) * Math.cos(longitudeDelta);

  return radiansToDegrees(Math.atan2(y, x));
};

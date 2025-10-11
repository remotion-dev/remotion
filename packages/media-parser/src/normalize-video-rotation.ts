export const normalizeVideoRotation = (rotation: number) => {
	return ((rotation % 360) + 360) % 360;
};

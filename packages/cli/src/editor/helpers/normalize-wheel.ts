// Taken from https://github.com/tldraw/tldraw/blob/254dfdfd77c4abde53240f7d8ca3558e08688493/packages/core/src/hooks/useZoomEvents.ts which is adapted from https://stackoverflow.com/a/13650579
const MAX_ZOOM_STEP = 10;

export function normalizeWheel(event: WheelEvent) {
	const {deltaY, deltaX} = event;

	let deltaZ = 0;

	if (event.ctrlKey || event.metaKey) {
		const signY = Math.sign(event.deltaY);
		const absDeltaY = Math.abs(event.deltaY);

		let dy = deltaY;

		if (absDeltaY > MAX_ZOOM_STEP) {
			dy = MAX_ZOOM_STEP * signY;
		}

		deltaZ = dy;
	}

	return {deltaX, deltaY, deltaZ};
}

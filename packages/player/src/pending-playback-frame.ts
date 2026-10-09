/**
 * The playback loop requests frames through a React state update, which commits
 * asynchronously. When every animation frame advances the timeline (e.g. 2x
 * playback of a 30fps composition on a 60Hz display), the next tick can run
 * before the previous update has committed. Advancing from the stale committed
 * frame then drops a frame permanently, and playback falls behind real time.
 *
 * Tracks the frame the loop last requested and, in request order, the frames it
 * advanced from that may still be the committed frame. Reading one of those back
 * means the request is still pending; any other frame came from elsewhere (e.g.
 * a seek) and is adopted.
 */
export const createPendingPlaybackFrame = () => {
	let requestedFrame: number | null = null;
	let supersededFrames: number[] = [];

	return {
		resolve(committedFrame: number): number {
			if (requestedFrame !== null && committedFrame !== requestedFrame) {
				const index = supersededFrames.indexOf(committedFrame);
				if (index !== -1) {
					// Updates commit in request order, so frames superseded before the
					// committed one can't be read back anymore.
					supersededFrames = supersededFrames.slice(index);
					return requestedFrame;
				}
			}

			requestedFrame = null;
			supersededFrames = [];
			return committedFrame;
		},
		request(fromFrame: number, nextFrame: number) {
			supersededFrames.push(fromFrame);
			requestedFrame = nextFrame;
		},
	};
};

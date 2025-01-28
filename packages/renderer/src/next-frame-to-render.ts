export const nextFrameToRenderState = (allFramesAndExtraFrames: number[]) => {
	const rendered = new Map<number, boolean>();

	return {
		getNextFrame: () => {
			const nextFrame = allFramesAndExtraFrames.find((frame) => {
				return !rendered.has(frame);
			});
			if (nextFrame === undefined) {
				throw new Error('No more frames to render');
			}

			rendered.set(nextFrame, true);
			return nextFrame;
		},
	};
};

export type NextFrameToRender = ReturnType<typeof nextFrameToRenderState>;

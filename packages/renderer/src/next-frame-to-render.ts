export const nextFrameToRenderState = (allFramesAndExtraFrames: number[]) => {
	const rendered = new Map<number, boolean>();

	return {
		setAsRendered: (frame: number) => {
			rendered.set(frame, true);
		},
		getNextFrame: () => {
			const nextFrame = allFramesAndExtraFrames.find((frame) => {
				return !rendered.has(frame);
			});

			return nextFrame;
		},
	};
};

export type NextFrameToRender = ReturnType<typeof nextFrameToRenderState>;

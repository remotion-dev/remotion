export const nextFrameToRenderState = ({
	allFramesAndExtraFrames,
}: {
	allFramesAndExtraFrames: number[];
}) => {
	const rendered = new Map<number, boolean>();
	const attempts = new Map<number, number>();

	return {
		getNextFrame: () => {
			const nextFrame = allFramesAndExtraFrames.find((frame) => {
				return !rendered.has(frame);
			});
			if (nextFrame === undefined) {
				throw new Error('No more frames to render');
			}

			rendered.set(nextFrame, true);
			return {frame: nextFrame, attempt: attempts.get(nextFrame) ?? 1};
		},
		returnFrame: (frame: number, attempt: number) => {
			rendered.delete(frame);
			attempts.set(frame, attempt);
		},
	};
};

export type NextFrameToRender = ReturnType<typeof nextFrameToRenderState>;

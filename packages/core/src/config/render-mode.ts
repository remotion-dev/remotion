const validRenderModes = ['png-sequence', 'mp4'] as const;

export type OutputFormat = typeof validRenderModes[number];

let format: OutputFormat = 'mp4';

export const getFormat = (): OutputFormat => {
	return format;
};

export const setOutputFormat = (newRenderMode: OutputFormat) => {
	if (!validRenderModes.includes(newRenderMode)) {
		throw new Error(
			`Render mode must be one of the following: ${validRenderModes.join(
				', '
			)}, but got ${newRenderMode}`
		);
	}
	format = newRenderMode;
};

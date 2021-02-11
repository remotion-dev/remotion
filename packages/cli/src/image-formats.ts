import minimist from 'minimist';

export type RenderMode = 'png-sequence' | 'mp4';

export const getRenderMode = (): RenderMode => {
	const arg = minimist<{
		png: boolean;
	}>(process.argv.slice(2));
	return arg.png ? 'png-sequence' : 'mp4';
};

export type ImageFormat = 'png' | 'jpeg';

export const getImageFormat = (renderMode: RenderMode): ImageFormat => {
	if (renderMode === 'mp4') {
		return 'jpeg';
	}
	if (renderMode === 'png-sequence') {
		return 'png';
	}
	throw new Error('Unrecognized render mode ' + renderMode);
};

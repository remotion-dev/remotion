import minimist from 'minimist';

export type RenderMode = 'png-sequence' | 'mp4';

export const getRenderMode = (): RenderMode => {
	const arg = minimist<{
		png: boolean;
	}>(process.argv.slice(2));
	return arg.png ? 'png-sequence' : 'mp4';
};

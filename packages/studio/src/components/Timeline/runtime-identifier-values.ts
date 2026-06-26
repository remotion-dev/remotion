import type {RuntimeIdentifierValues} from '@remotion/studio-shared';

export const getRuntimeIdentifierValues = ({
	durationInFrames,
	fps,
	height,
	width,
}: {
	durationInFrames: number;
	fps: number;
	height: number;
	width: number;
}): RuntimeIdentifierValues => ({
	durationInFrames,
	fps,
	height,
	width,
});

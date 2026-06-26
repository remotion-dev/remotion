import type {VideoConfigValues} from '@remotion/studio-shared';
import {useMemo} from 'react';
import {Internals} from 'remotion';

export const getVideoConfigValues = ({
	durationInFrames,
	fps,
	height,
	width,
}: {
	durationInFrames: number;
	fps: number;
	height: number;
	width: number;
}): VideoConfigValues => ({
	durationInFrames,
	fps,
	height,
	width,
});

export const useVideoConfigValues = (): VideoConfigValues | null => {
	const videoConfig = Internals.useUnsafeVideoConfig();

	return useMemo(
		() => (videoConfig === null ? null : getVideoConfigValues(videoConfig)),
		[videoConfig],
	);
};

import type {RuntimeIdentifierValues} from '@remotion/studio-shared';
import {useMemo} from 'react';
import {Internals} from 'remotion';

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

export const useRuntimeIdentifierValues =
	(): RuntimeIdentifierValues | null => {
		const videoConfig = Internals.useUnsafeVideoConfig();

		return useMemo(
			() =>
				videoConfig === null ? null : getRuntimeIdentifierValues(videoConfig),
			[videoConfig],
		);
	};

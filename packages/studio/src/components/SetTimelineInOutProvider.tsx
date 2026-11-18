import {PlayerInternals} from '@remotion/player';
import React, {useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import type {
	SetTimelineInOutContextValue,
	TimelineInOutContextValue,
} from '../state/in-out';
import {SetTimelineInOutContext} from '../state/in-out';
import {loadMarks, persistMarks} from '../state/marks';

export const SetTimelineInOutProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [inAndOutFrames, setInAndOutFrames] =
		useState<TimelineInOutContextValue>(() => loadMarks());

	const config = Internals.useUnsafeVideoConfig();
	const marks = config ? inAndOutFrames[config.id] : null;
	const maxFrame = (config?.durationInFrames ?? 1) - 1;
	const inFrame = marks?.inFrame ?? null;
	const outFrame = marks?.outFrame ?? null;
	const playbackRange = useMemo(
		() => ({
			inFrame: inFrame !== null && inFrame < maxFrame ? inFrame : null,
			outFrame: outFrame !== null && outFrame < maxFrame ? outFrame : null,
		}),
		[inFrame, maxFrame, outFrame],
	);

	const setTimelineInOutContextValue =
		useMemo((): SetTimelineInOutContextValue => {
			return {
				setInAndOutFrames,
			};
		}, []);

	useEffect(() => {
		persistMarks(inAndOutFrames);
	}, [inAndOutFrames]);

	return (
		<PlayerInternals.PlaybackRangeContext.Provider value={playbackRange}>
			<SetTimelineInOutContext.Provider value={setTimelineInOutContextValue}>
				{children}
			</SetTimelineInOutContext.Provider>
		</PlayerInternals.PlaybackRangeContext.Provider>
	);
};

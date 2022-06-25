import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import {continueRender, delayRender} from './delay-render';
import {random} from './random';
import type {
	PlayableMediaTag,
	SetTimelineContextValue,
	TimelineContextValue,
} from './timeline-position-state';
import {SetTimelineContext, TimelineContext} from './timeline-position-state';

export const TimelineRoot: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [remotionRootId] = useState(() => String(random(null)));
	const [frame, setFrame] = useState<number>(() => {
		return window.remotion_initialFrame ?? 0;
	});
	const [playing, setPlaying] = useState<boolean>(false);
	const imperativePlaying = useRef<boolean>(false);

	const [playbackRate, setPlaybackRate] = useState(1);
	const audioAndVideoTags = useRef<PlayableMediaTag[]>([]);

	useLayoutEffect(() => {
		// TODO parallelize
		if (typeof window !== 'undefined') {
			window.remotion_setFrame = (f: number) => {
				const id = delayRender(`Setting the current frame to ${f}`);
				setFrame(f);
				requestAnimationFrame(() => continueRender(id));
			};

			window.remotion_isPlayer = false;
		}
	}, []);

	const timelineContextValue = useMemo((): TimelineContextValue => {
		return {
			frame,
			playing,
			imperativePlaying,
			rootId: remotionRootId,
			playbackRate,
			setPlaybackRate,
			audioAndVideoTags,
		};
	}, [frame, playbackRate, playing, remotionRootId]);

	const setTimelineContextValue = useMemo((): SetTimelineContextValue => {
		return {
			setFrame,
			setPlaying,
		};
	}, []);

	return (
		<TimelineContext.Provider value={timelineContextValue}>
			<SetTimelineContext.Provider value={setTimelineContextValue}>
				{children}
			</SetTimelineContext.Provider>
		</TimelineContext.Provider>
	);
};

import type {MutableRefObject} from 'react';
import React, {
	createContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {random} from './random';
import {
	getInitialFrameState,
	type PlayableMediaTag,
} from './timeline-position-state';
import {useDelayRender} from './use-delay-render';

export type TimelineContextValue = {
	frame: Record<string, number>;
	playing: boolean;
	rootId: string;
	imperativePlaying: MutableRefObject<boolean>;
	audioAndVideoTags: MutableRefObject<PlayableMediaTag[]>;
};

export type PlaybackRateContextValue = {
	playbackRate: number;
	setPlaybackRate: (u: React.SetStateAction<number>) => void;
};

export type SetTimelineContextValue = {
	setFrame: (u: React.SetStateAction<Record<string, number>>) => void;
	setPlaying: (u: React.SetStateAction<boolean>) => void;
};

export const SetTimelineContext = createContext<SetTimelineContextValue>({
	setFrame: () => {
		throw new Error('default');
	},
	setPlaying: () => {
		throw new Error('default');
	},
});

export const TimelineContext = createContext<TimelineContextValue | null>(null);

export const PlaybackRateContext =
	createContext<PlaybackRateContextValue | null>(null);

export const AbsoluteTimeContext = createContext<TimelineContextValue | null>(
	null,
);

export const TimelineContextProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly frameState: Record<string, number> | null;
}> = ({children, frameState}) => {
	const [playing, setPlaying] = useState<boolean>(false);
	const imperativePlaying = useRef<boolean>(false);

	const [playbackRate, setPlaybackRate] = useState(1);
	const audioAndVideoTags = useRef<PlayableMediaTag[]>([]);
	const [remotionRootId] = useState(() => String(random(null)));
	const [_frame, setFrame] = useState<Record<string, number>>(() =>
		getInitialFrameState(),
	);

	const frame = frameState ?? _frame;

	const {delayRender, continueRender} = useDelayRender();

	if (typeof window !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			window.remotion_setFrame = (f: number, composition: string, attempt) => {
				window.remotion_attempt = attempt;
				const id = delayRender(`Setting the current frame to ${f}`);

				let asyncUpdate = true;

				setFrame((s) => {
					const currentFrame = s[composition] ?? window.remotion_initialFrame;
					// Avoid cloning the object
					if (currentFrame === f) {
						asyncUpdate = false;
						return s;
					}

					return {
						...s,
						[composition]: f,
					};
				});

				// After setting the state, need to wait until it is applied in the next cycle
				if (asyncUpdate) {
					requestAnimationFrame(() => continueRender(id));
				} else {
					continueRender(id);
				}
			};

			window.remotion_isPlayer = false;
		}, [continueRender, delayRender]);
	}

	const timelineContextValue = useMemo((): TimelineContextValue => {
		return {
			frame,
			playing,
			imperativePlaying,
			rootId: remotionRootId,
			audioAndVideoTags,
		};
	}, [frame, playing, remotionRootId]);

	const playbackRateContextValue = useMemo((): PlaybackRateContextValue => {
		return {
			playbackRate,
			setPlaybackRate,
		};
	}, [playbackRate]);

	const setTimelineContextValue = useMemo((): SetTimelineContextValue => {
		return {
			setFrame,
			setPlaying,
		};
	}, []);

	return (
		<AbsoluteTimeContext.Provider value={timelineContextValue}>
			<PlaybackRateContext.Provider value={playbackRateContextValue}>
				<TimelineContext.Provider value={timelineContextValue}>
					<SetTimelineContext.Provider value={setTimelineContextValue}>
						{children}
					</SetTimelineContext.Provider>
				</TimelineContext.Provider>
			</PlaybackRateContext.Provider>
		</AbsoluteTimeContext.Provider>
	);
};

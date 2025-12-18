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
	playbackRate: number;
	imperativePlaying: MutableRefObject<boolean>;
	setPlaybackRate: (u: React.SetStateAction<number>) => void;
	audioAndVideoTags: MutableRefObject<PlayableMediaTag[]>;
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

export const TimelineContext = createContext<TimelineContextValue>({
	frame: {},
	playing: false,
	playbackRate: 1,
	rootId: '',
	imperativePlaying: {
		current: false,
	},
	setPlaybackRate: () => {
		throw new Error('default');
	},
	audioAndVideoTags: {current: []},
});

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

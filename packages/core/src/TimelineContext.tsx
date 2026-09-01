import type {RefObject} from 'react';
import React, {
	createContext,
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {createRuntimeValueStore} from './runtime-value-store.js';
import {
	getInitialFrameState,
	type PlayableMediaTag,
} from './timeline-position-state';
import {useDelayRender} from './use-delay-render';

export type TimelineContextValue = {
	frame: Record<string, number>;
	isPlaying: () => boolean;
	audioAndVideoTags: RefObject<PlayableMediaTag[]>;
};

export type PlaybackRateContextValue = {
	playbackRate: number;
	setPlaybackRate: (u: React.SetStateAction<number>) => void;
};

export type PlayingState = Readonly<{
	playing: boolean;
}>;

export type BufferingState = Readonly<{
	buffering: boolean;
}>;

export type LastSeekState = Readonly<{
	frame: number | null;
	sequence: number;
}>;

const initialLastSeekState: LastSeekState = {frame: null, sequence: 0};

export type SetTimelineContextValue = {
	setFrame: (u: React.SetStateAction<Record<string, number>>) => void;
	setPlaying: (u: React.SetStateAction<boolean>) => void;
	setBuffering: (buffering: boolean) => void;
	setLastSeek: (frame: number) => void;
	subscribePlaying: (listener: (state: PlayingState) => void) => () => void;
	subscribeBuffering: (listener: (state: BufferingState) => void) => () => void;
	subscribeLastSeek: (listener: (state: LastSeekState) => void) => () => void;
	isPlaying: () => boolean;
	isBuffering: () => boolean;
	getLastSeek: () => LastSeekState;
	frameRef: RefObject<Record<string, number>>;
	audioAndVideoTags: RefObject<PlayableMediaTag[]>;
};

const missingSetTimelineContext = (): never => {
	throw new Error(
		'SetTimelineContext is missing. This is likely caused by a Remotion version mismatch.',
	);
};

export const SetTimelineContext = createContext<SetTimelineContextValue>({
	setFrame: missingSetTimelineContext,
	setPlaying: missingSetTimelineContext,
	setBuffering: missingSetTimelineContext,
	setLastSeek: missingSetTimelineContext,
	subscribePlaying: () => () => undefined,
	subscribeBuffering: () => () => undefined,
	subscribeLastSeek: () => () => undefined,
	isPlaying: () => false,
	isBuffering: missingSetTimelineContext,
	getLastSeek: () => initialLastSeekState,
	frameRef: {current: {}},
	audioAndVideoTags: {current: []},
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
	const playingStore = useMemo(
		() => createRuntimeValueStore({playing: false}),
		[],
	);
	const bufferingStore = useMemo(
		() => createRuntimeValueStore({buffering: false}),
		[],
	);
	const [playbackRate, setPlaybackRate] = useState(1);
	const audioAndVideoTags = useRef<PlayableMediaTag[]>([]);
	const [_frame, setFrame] = useState<Record<string, number>>(() =>
		getInitialFrameState(),
	);

	const frame = frameState ?? _frame;
	const frameRef = useRef(frame);
	frameRef.current = frame;

	const readIsPlaying = useCallback(
		() => playingStore.store.getSnapshot().playing,
		[playingStore],
	);
	const readIsBuffering = useCallback(
		() => bufferingStore.store.getSnapshot().buffering,
		[bufferingStore],
	);
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
			isPlaying: readIsPlaying,
			audioAndVideoTags,
		};
	}, [frame, readIsPlaying]);

	const playbackRateContextValue = useMemo((): PlaybackRateContextValue => {
		return {
			playbackRate,
			setPlaybackRate,
		};
	}, [playbackRate]);

	const setTimelineContextValue = useMemo((): SetTimelineContextValue => {
		return {
			setFrame,
			setPlaying: (updater) => {
				const current = playingStore.store.getSnapshot().playing;
				const next = typeof updater === 'function' ? updater(current) : updater;
				if (current !== next) {
					playingStore.setSnapshot({playing: next});
				}
			},
			setBuffering: (buffering) => {
				if (readIsBuffering() !== buffering) {
					bufferingStore.setSnapshot({buffering});
				}
			},
			setLastSeek: () => undefined,
			subscribePlaying: playingStore.store.subscribe,
			subscribeBuffering: bufferingStore.store.subscribe,
			subscribeLastSeek: () => () => undefined,
			isPlaying: readIsPlaying,
			isBuffering: readIsBuffering,
			getLastSeek: () => initialLastSeekState,
			frameRef,
			audioAndVideoTags,
		};
	}, [bufferingStore, playingStore, readIsBuffering, readIsPlaying]);

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

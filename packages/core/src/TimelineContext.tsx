import type {RefObject} from 'react';
import React, {
	createContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	createRuntimeValueStore,
	type RuntimeValueStoreController,
} from './runtime-value-store.js';
import {
	getInitialFrameState,
	type PlayableMediaTag,
} from './timeline-position-state';
import {useDelayRender} from './use-delay-render';

export type TimelineContextValue = {
	frame: Record<string, number>;
	playbackStore: RuntimeValueStoreController;
	audioAndVideoTags: RefObject<PlayableMediaTag[]>;
	registerPlaybackListener: (listener: (playing: boolean) => void) => void;
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
	const playbackStore = useMemo(
		() => createRuntimeValueStore({playing: false}),
		[],
	);

	const registerPlaybackListener = useMemo(() => {
		return (listener: (playing: boolean) => void) => {
			return playbackStore.store.subscribe((newSnap, oldSnap) => {
				if (newSnap.playing !== oldSnap.playing) {
					listener(newSnap.playing as boolean);
				}
			});
		};
	}, [playbackStore]);

	useMemo(() => {
		registerPlaybackListener((playing) => {
			if (playing) {
				audioAndVideoTags.current.forEach((tag) =>
					tag.play('playbackStore playing state became true'),
				);
			}
		});
	}, [registerPlaybackListener]);

	const [playbackRate, setPlaybackRate] = useState(1);
	const audioAndVideoTags = useRef<PlayableMediaTag[]>([]);
	const [_frame, setFrame] = useState<Record<string, number>>(() =>
		getInitialFrameState(),
	);

	const frame = frameState ?? _frame;
	const frameRef = useRef(frame);
	frameRef.current = frame;

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
			playbackStore,
			audioAndVideoTags,
			registerPlaybackListener,
		};
	}, [frame, playbackStore, registerPlaybackListener]);

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
				if (typeof updater === 'function') {
					const current = playbackStore.store.getSnapshot().playing as boolean;
					playbackStore.setSnapshot({playing: updater(current)});
				} else {
					playbackStore.setSnapshot({playing: updater});
				}
			},
		};
	}, [playbackStore]);

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

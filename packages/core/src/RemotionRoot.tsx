import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {CompositionManagerProvider} from './CompositionManager.js';
import {continueRender, delayRender} from './delay-render.js';
import {EditorPropsProvider} from './EditorProps.js';
import {NativeLayersProvider} from './NativeLayers.js';
import type {TNonceContext} from './nonce.js';
import {NonceContext} from './nonce.js';
import {PrefetchProvider} from './prefetch-state.js';
import {random} from './random.js';
import type {
	PlayableMediaTag,
	SetTimelineContextValue,
	TimelineContextValue,
} from './timeline-position-state.js';
import {
	SetTimelineContext,
	TimelineContext,
} from './timeline-position-state.js';
import {DurationsContextProvider} from './video/duration-state.js';

declare const __webpack_module__: {
	hot: {
		addStatusHandler(callback: (status: string) => void): void;
	};
};

export const RemotionRoot: React.FC<{
	children: React.ReactNode;
	numberOfAudioTags: number;
}> = ({children, numberOfAudioTags}) => {
	const [remotionRootId] = useState(() => String(random(null)));
	const [frame, setFrame] = useState<number>(window.remotion_initialFrame ?? 0);
	const [playing, setPlaying] = useState<boolean>(false);
	const imperativePlaying = useRef<boolean>(false);
	const [fastRefreshes, setFastRefreshes] = useState(0);
	const [playbackRate, setPlaybackRate] = useState(1);
	const audioAndVideoTags = useRef<PlayableMediaTag[]>([]);

	if (typeof window !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			window.remotion_setFrame = (f: number) => {
				const id = delayRender(`Setting the current frame to ${f}`);
				setFrame(f);
				requestAnimationFrame(() => continueRender(id));
			};

			window.remotion_isPlayer = false;
		}, []);
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

	const nonceContext = useMemo((): TNonceContext => {
		let counter = 0;
		return {
			getNonce: () => counter++,
			fastRefreshes,
		};
	}, [fastRefreshes]);

	useEffect(() => {
		if (typeof __webpack_module__ !== 'undefined') {
			if (__webpack_module__.hot) {
				__webpack_module__.hot.addStatusHandler((status) => {
					if (status === 'idle') {
						setFastRefreshes((i) => i + 1);
					}
				});
			}
		}
	}, []);

	return (
		<NonceContext.Provider value={nonceContext}>
			<TimelineContext.Provider value={timelineContextValue}>
				<SetTimelineContext.Provider value={setTimelineContextValue}>
					<EditorPropsProvider>
						<PrefetchProvider>
							<NativeLayersProvider>
								<CompositionManagerProvider
									numberOfAudioTags={numberOfAudioTags}
								>
									<DurationsContextProvider>
										{children}
									</DurationsContextProvider>
								</CompositionManagerProvider>
							</NativeLayersProvider>
						</PrefetchProvider>
					</EditorPropsProvider>
				</SetTimelineContext.Provider>
			</TimelineContext.Provider>
		</NonceContext.Provider>
	);
};

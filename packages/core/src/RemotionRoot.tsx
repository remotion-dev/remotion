import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {CompositionManagerProvider} from './CompositionManager.js';
import {EditorPropsProvider} from './EditorProps.js';
import {BufferingProvider} from './buffering.js';
import {continueRender, delayRender} from './delay-render.js';
import type {LoggingContextValue} from './log-level-context.js';
import {LogLevelContext} from './log-level-context.js';
import type {LogLevel} from './log.js';
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
	getInitialFrameState,
} from './timeline-position-state.js';
import {DurationsContextProvider} from './video/duration-state.js';

declare const __webpack_module__: {
	hot: {
		addStatusHandler(callback: (status: string) => void): void;
	};
};

export const RemotionRoot: React.FC<{
	readonly children: React.ReactNode;
	readonly numberOfAudioTags: number;
	readonly logLevel: LogLevel;
}> = ({children, numberOfAudioTags, logLevel}) => {
	const [remotionRootId] = useState(() => String(random(null)));
	const [frame, setFrame] = useState<Record<string, number>>(() =>
		getInitialFrameState(),
	);
	const [playing, setPlaying] = useState<boolean>(false);
	const imperativePlaying = useRef<boolean>(false);
	const [fastRefreshes, setFastRefreshes] = useState(0);
	const [playbackRate, setPlaybackRate] = useState(1);
	const audioAndVideoTags = useRef<PlayableMediaTag[]>([]);

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

	const logging: LoggingContextValue = useMemo(() => {
		return {logLevel, mountTime: Date.now()};
	}, [logLevel]);

	return (
		<LogLevelContext.Provider value={logging}>
			<NonceContext.Provider value={nonceContext}>
				<TimelineContext.Provider value={timelineContextValue}>
					<SetTimelineContext.Provider value={setTimelineContextValue}>
						<EditorPropsProvider>
							<PrefetchProvider>
								<CompositionManagerProvider
									numberOfAudioTags={numberOfAudioTags}
								>
									<DurationsContextProvider>
										<BufferingProvider>{children}</BufferingProvider>
									</DurationsContextProvider>
								</CompositionManagerProvider>
							</PrefetchProvider>
						</EditorPropsProvider>
					</SetTimelineContext.Provider>
				</TimelineContext.Provider>
			</NonceContext.Provider>
		</LogLevelContext.Provider>
	);
};

import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {SharedAudioContextProvider} from './audio/shared-audio-tags';
import {CompositionManagerProvider} from './CompositionManager';
import {continueRender, delayRender} from './delay-render';
import type {TNonceContext} from './nonce';
import {NonceContext} from './nonce';
import {PrefetchProvider} from './prefetch-state';
import {random} from './random';
import type {
	PlayableMediaTag,
	SetTimelineContextValue,
	TimelineContextValue,
} from './timeline-position-state';
import {SetTimelineContext, TimelineContext} from './timeline-position-state';
import {DurationsContextProvider} from './video/duration-state';

export const RemotionRoot: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [remotionRootId] = useState(() => String(random(null)));
	const [frame, setFrame] = useState<number>(window.remotion_initialFrame ?? 0);
	const [playing, setPlaying] = useState<boolean>(false);
	const imperativePlaying = useRef<boolean>(false);
	const [fastRefreshes, setFastRefreshes] = useState(0);
	const [playbackRate, setPlaybackRate] = useState(1);
	const audioAndVideoTags = useRef<PlayableMediaTag[]>([]);

	useLayoutEffect(() => {
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

	const nonceContext = useMemo((): TNonceContext => {
		let counter = 0;
		return {
			getNonce: () => counter++,
			fastRefreshes,
		};
	}, [fastRefreshes]);

	useEffect(() => {
		if (module.hot) {
			module.hot.addStatusHandler((status) => {
				if (status === 'idle') {
					setFastRefreshes((i) => i + 1);
				}
			});
		}
	}, []);

	return (
		<NonceContext.Provider value={nonceContext}>
			<TimelineContext.Provider value={timelineContextValue}>
				<SetTimelineContext.Provider value={setTimelineContextValue}>
					<PrefetchProvider>
						<CompositionManagerProvider>
							<DurationsContextProvider>
								<SharedAudioContextProvider
									// In the preview, which is mostly played on Desktop, we opt out of the autoplay policy fix as described in https://github.com/remotion-dev/remotion/pull/554, as it mostly applies to mobile.
									numberOfAudioTags={0}
								>
									{children}
								</SharedAudioContextProvider>
							</DurationsContextProvider>
						</CompositionManagerProvider>
					</PrefetchProvider>
				</SetTimelineContext.Provider>
			</TimelineContext.Provider>
		</NonceContext.Provider>
	);
};

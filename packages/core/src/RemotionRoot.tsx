import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {SharedAudioContextProvider} from './audio/shared-audio-tags';
import {CompositionManagerProvider} from './CompositionManager';
import {NonceContext, TNonceContext} from './nonce';
import {random} from './random';
import {continueRender, delayRender} from './ready-manager';
import {
	SetTimelineContext,
	SetTimelineContextValue,
	TimelineContext,
	TimelineContextValue,
} from './timeline-position-state';

export const RemotionRoot: React.FC = ({children}) => {
	const [remotionRootId] = useState(() => String(random(null)));
	const [frame, setFrame] = useState<number>(window.remotion_initialFrame ?? 0);
	const [playing, setPlaying] = useState<boolean>(false);
	const [fastRefreshes, setFastRefreshes] = useState(0);

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			window.remotion_setFrame = (f: number) => {
				const id = delayRender();
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
			rootId: remotionRootId,
		};
	}, [frame, playing, remotionRootId]);

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
					<CompositionManagerProvider>
						<SharedAudioContextProvider
							// In the preview, which is mostly played on Desktop, we opt out of the autoplay policy fix as described in https://github.com/remotion-dev/remotion/pull/554, as it mostly applies to mobile.
							numberOfAudioTags={0}
						>
							{children}
						</SharedAudioContextProvider>
					</CompositionManagerProvider>
				</SetTimelineContext.Provider>
			</TimelineContext.Provider>
		</NonceContext.Provider>
	);
};

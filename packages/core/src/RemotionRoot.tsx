import React, {useEffect, useMemo, useState} from 'react';
import {EditorPropsProvider} from './EditorProps.js';
import {RenderAssetManagerProvider} from './RenderAssetManager.js';
import {SequenceManagerProvider} from './SequenceManager.js';
import {TimelineContextProvider} from './TimelineContext.js';
import {SharedAudioContextProvider} from './audio/shared-audio-tags.js';
import {BufferingProvider} from './buffering.js';
import type {LoggingContextValue} from './log-level-context.js';
import {LogLevelContext} from './log-level-context.js';
import type {LogLevel} from './log.js';
import type {TNonceContext, TSetNonceContext} from './nonce.js';
import {NonceContext, SetNonceContext} from './nonce.js';
import {PrefetchProvider} from './prefetch-state.js';
import {MediaEnabledProvider} from './use-media-enabled.js';
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
	readonly audioLatencyHint: AudioContextLatencyCategory;
	readonly videoEnabled: boolean | null;
	readonly audioEnabled: boolean | null;
	readonly frameState: Record<string, number> | null;
}> = ({
	children,
	numberOfAudioTags,
	logLevel,
	audioLatencyHint,
	videoEnabled,
	audioEnabled,
	frameState,
}) => {
	const [fastRefreshes, setFastRefreshes] = useState(0);
	const [manualRefreshes, setManualRefreshes] = useState(0);

	const nonceContext = useMemo((): TNonceContext => {
		let counter = 0;
		return {
			getNonce: () => counter++,
			fastRefreshes,
			manualRefreshes,
		};
	}, [fastRefreshes, manualRefreshes]);

	const setNonceContext = useMemo((): TSetNonceContext => {
		return {
			increaseManualRefreshes: () => {
				setManualRefreshes((i) => i + 1);
			},
		};
	}, []);

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
				<SetNonceContext.Provider value={setNonceContext}>
					<TimelineContextProvider frameState={frameState}>
						<MediaEnabledProvider
							videoEnabled={videoEnabled}
							audioEnabled={audioEnabled}
						>
							<EditorPropsProvider>
								<PrefetchProvider>
									<SequenceManagerProvider>
										<RenderAssetManagerProvider>
											<SharedAudioContextProvider
												numberOfAudioTags={numberOfAudioTags}
												audioLatencyHint={audioLatencyHint}
											>
												<DurationsContextProvider>
													<BufferingProvider>{children}</BufferingProvider>
												</DurationsContextProvider>
											</SharedAudioContextProvider>
										</RenderAssetManagerProvider>
									</SequenceManagerProvider>
								</PrefetchProvider>
							</EditorPropsProvider>
						</MediaEnabledProvider>
					</TimelineContextProvider>
				</SetNonceContext.Provider>
			</NonceContext.Provider>
		</LogLevelContext.Provider>
	);
};

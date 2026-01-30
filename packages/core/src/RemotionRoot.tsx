import React, {useMemo} from 'react';
import {EditorPropsProvider} from './EditorProps.js';
import {SequenceManagerProvider} from './SequenceManager.js';
import {TimelineContextProvider} from './TimelineContext.js';
import {SharedAudioContextProvider} from './audio/shared-audio-tags.js';
import {BufferingProvider} from './buffering.js';
import type {LoggingContextValue} from './log-level-context.js';
import {LogLevelContext} from './log-level-context.js';
import type {LogLevel} from './log.js';
import type {TNonceContext} from './nonce.js';
import {NonceContext} from './nonce.js';
import {PrefetchProvider} from './prefetch-state.js';
import {MediaEnabledProvider} from './use-media-enabled.js';
import {DurationsContextProvider} from './video/duration-state.js';

export const RemotionRootContexts: React.FC<{
	readonly children: React.ReactNode;
	readonly numberOfAudioTags: number;
	readonly logLevel: LogLevel;
	readonly audioLatencyHint: AudioContextLatencyCategory;
	readonly videoEnabled: boolean;
	readonly audioEnabled: boolean;
	readonly frameState: Record<string, number> | null;
	readonly nonceContextSeed?: number;
}> = ({
	children,
	numberOfAudioTags,
	logLevel,
	audioLatencyHint,
	videoEnabled,
	audioEnabled,
	frameState,
	nonceContextSeed = 0,
}) => {
	const nonceContext = useMemo((): TNonceContext => {
		let counter = 0;
		return {
			getNonce: () => counter++,
		};
	}, [nonceContextSeed]);

	const logging: LoggingContextValue = useMemo(() => {
		return {logLevel, mountTime: Date.now()};
	}, [logLevel]);

	return (
		<LogLevelContext.Provider value={logging}>
			<NonceContext.Provider value={nonceContext}>
				<TimelineContextProvider frameState={frameState}>
					<MediaEnabledProvider
						videoEnabled={videoEnabled}
						audioEnabled={audioEnabled}
					>
						<EditorPropsProvider>
							<PrefetchProvider>
								<SequenceManagerProvider>
									<SharedAudioContextProvider
										numberOfAudioTags={numberOfAudioTags}
										audioLatencyHint={audioLatencyHint}
										audioEnabled={audioEnabled}
									>
										<DurationsContextProvider>
											<BufferingProvider>{children}</BufferingProvider>
										</DurationsContextProvider>
									</SharedAudioContextProvider>
								</SequenceManagerProvider>
							</PrefetchProvider>
						</EditorPropsProvider>
					</MediaEnabledProvider>
				</TimelineContextProvider>
			</NonceContext.Provider>
		</LogLevelContext.Provider>
	);
};

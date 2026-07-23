import React, {useMemo} from 'react';
import {
	SharedAudioContextProvider,
	SharedAudioTagsContextProvider,
} from './audio/shared-audio-tags.js';
import {BufferingProvider} from './buffering.js';
import {EditorPropsProvider} from './EditorProps.js';
import type {LoggingContextValue} from './log-level-context.js';
import {LogLevelContext} from './log-level-context.js';
import type {LogLevel} from './log.js';
import type {TNonceContext} from './nonce.js';
import {NonceContext} from './nonce.js';
import {PrefetchProvider} from './prefetch-state.js';
import {SequenceManagerProvider} from './SequenceManager.js';
import {TimelineContextProvider} from './TimelineContext.js';
import {MediaEnabledProvider} from './use-media-enabled.js';
import {DurationsContextProvider} from './video/duration-state.js';

export const RemotionRootContexts: React.FC<{
	readonly children: React.ReactNode;
	readonly numberOfAudioTags: number;
	readonly logLevel: LogLevel;
	readonly audioLatencyHint: AudioContextLatencyCategory;
	readonly previewSampleRate: number | null;
	readonly videoEnabled: boolean;
	readonly audioEnabled: boolean;
	readonly frameState: Record<string, number> | null;
}> = ({
	children,
	numberOfAudioTags,
	logLevel,
	audioLatencyHint,
	previewSampleRate,
	videoEnabled,
	audioEnabled,
	frameState,
}) => {
	const nonceContext = useMemo((): TNonceContext => {
		let counter = 0;
		return {
			getNonce: () => counter++,
		};
	}, []);

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
									<DurationsContextProvider>
										<BufferingProvider>
											<SharedAudioContextProvider
												audioLatencyHint={audioLatencyHint}
												audioEnabled={audioEnabled}
												previewSampleRate={previewSampleRate}
											>
												<SharedAudioTagsContextProvider
													numberOfAudioTags={numberOfAudioTags}
												>
													{children}
												</SharedAudioTagsContextProvider>
											</SharedAudioContextProvider>
										</BufferingProvider>
									</DurationsContextProvider>
								</SequenceManagerProvider>
							</PrefetchProvider>
						</EditorPropsProvider>
					</MediaEnabledProvider>
				</TimelineContextProvider>
			</NonceContext.Provider>
		</LogLevelContext.Provider>
	);
};

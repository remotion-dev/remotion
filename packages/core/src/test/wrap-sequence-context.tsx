import React, {useContext, useMemo} from 'react';
import {BufferingProvider} from '../buffering.js';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import type {CompositionManagerContext} from '../CompositionManagerContext.js';
import {CompositionManager} from '../CompositionManagerContext.js';
import type {LoggingContextValue} from '../log-level-context.js';
import {LogLevelContext} from '../log-level-context.js';
import {createRuntimeValueStore} from '../runtime-value-store.js';
import {SequenceManagerProvider} from '../SequenceManager.js';
import type {
	PlaybackRateContextValue,
	SetTimelineContextValue,
	TimelineContextValue,
} from '../TimelineContext.js';
import {
	AbsoluteTimeContext,
	PlaybackRateContext,
	SetTimelineContext,
	TimelineContext,
} from '../TimelineContext.js';

const Comp: React.FC = () => null;
const initialLastSeekState = {frame: null, sequence: 0} as const;

const makeMockCompositionContext = (
	durationInFrames: number,
): CompositionManagerContext => ({
	compositions: [
		{
			id: 'my-comp',
			durationInFrames,
			component: Comp,
			defaultProps: {},
			folderName: null,
			fps: 30,
			height: 1080,
			width: 1080,
			parentFolderName: null,
			order: null,
			calculateMetadata: null,
			schema: null,
			stack: null,
		},
	],
	folders: [],
	currentAssetMetadata: null,
	canvasContent: {type: 'composition', compositionId: 'my-comp'},
	currentCompositionMetadata: {
		defaultCodec: null,
		defaultOutName: null,
		defaultPixelFormat: null,
		defaultProResProfile: null,
		defaultSampleRate: null,
		defaultVideoImageFormat: null,
		durationInFrames,
		fps: 30,
		height: 1080,
		width: 1080,
		props: {},
	},
});

const logContext: LoggingContextValue = {
	logLevel: 'info',
	mountTime: 0,
};

const mockPlaybackRateContext: PlaybackRateContextValue = {
	playbackRate: 1,
	setPlaybackRate: () => {
		throw new Error('not implemented');
	},
};

const MaybeTimelineProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly timelineContext: TimelineContextValue;
}> = ({children, timelineContext}) => {
	const existing = useContext(TimelineContext);
	if (existing !== null) {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		return <>{children}</>;
	}

	return (
		<AbsoluteTimeContext.Provider value={timelineContext}>
			<TimelineContext.Provider value={timelineContext}>
				{children}
			</TimelineContext.Provider>
		</AbsoluteTimeContext.Provider>
	);
};

const MaybePlaybackRateProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const existing = useContext(PlaybackRateContext);
	if (existing !== null) {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		return <>{children}</>;
	}

	return (
		<PlaybackRateContext.Provider value={mockPlaybackRateContext}>
			{children}
		</PlaybackRateContext.Provider>
	);
};

export const WrapSequenceContext: React.FC<{
	readonly children: React.ReactNode;
	readonly compositionDurationInFrames?: number;
	readonly currentFrame?: number;
}> = ({children, compositionDurationInFrames = 1000000, currentFrame = 0}) => {
	const compositionContext = useMemo(
		() => makeMockCompositionContext(compositionDurationInFrames),
		[compositionDurationInFrames],
	);
	const timelineContext = useMemo<TimelineContextValue>(
		() => ({
			frame: {'my-comp': currentFrame},
			isPlaying: () => false,
			audioAndVideoTags: {current: []},
		}),
		[currentFrame],
	);
	const bufferingStore = useMemo(
		() => createRuntimeValueStore({buffering: false}),
		[],
	);
	const setTimelineContext = useMemo<SetTimelineContextValue>(
		() => ({
			setFrame: () => undefined,
			setPlaying: () => undefined,
			setBuffering: (buffering) => {
				if (bufferingStore.store.getSnapshot().buffering !== buffering) {
					bufferingStore.setSnapshot({buffering});
				}
			},
			setLastSeek: () => undefined,
			subscribePlaying: () => () => undefined,
			subscribeBuffering: bufferingStore.store.subscribe,
			subscribeLastSeek: () => () => undefined,
			isPlaying: () => false,
			isBuffering: () => bufferingStore.store.getSnapshot().buffering,
			getLastSeek: () => initialLastSeekState,
			frameRef: {current: {}},
			audioAndVideoTags: {current: []},
		}),
		[bufferingStore],
	);

	return (
		<LogLevelContext.Provider value={logContext}>
			<SetTimelineContext.Provider value={setTimelineContext}>
				<BufferingProvider>
					<CanUseRemotionHooksProvider>
						<MaybeTimelineProvider timelineContext={timelineContext}>
							<MaybePlaybackRateProvider>
								<SequenceManagerProvider>
									<CompositionManager.Provider value={compositionContext}>
										{children}
									</CompositionManager.Provider>
								</SequenceManagerProvider>
							</MaybePlaybackRateProvider>
						</MaybeTimelineProvider>
					</CanUseRemotionHooksProvider>
				</BufferingProvider>
			</SetTimelineContext.Provider>
		</LogLevelContext.Provider>
	);
};

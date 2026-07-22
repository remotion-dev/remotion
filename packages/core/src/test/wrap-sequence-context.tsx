import React, {useContext, useMemo} from 'react';
import {BufferingProvider} from '../buffering.js';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import type {CompositionManagerContext} from '../CompositionManagerContext.js';
import {CompositionManager} from '../CompositionManagerContext.js';
import type {LoggingContextValue} from '../log-level-context.js';
import {LogLevelContext} from '../log-level-context.js';
import {SequenceManagerProvider} from '../SequenceManager.js';
import type {
	PlaybackRateContextValue,
	TimelineContextValue,
} from '../TimelineContext.js';
import {
	AbsoluteTimeContext,
	PlaybackRateContext,
	TimelineContext,
} from '../TimelineContext.js';

const Comp: React.FC = () => null;

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
			nonce: [[0, 0]],
			calculateMetadata: null,
			schema: null,
			stack: null,
		},
	],
	folders: [],
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
			playing: false,
			rootId: 'test-root',
			imperativePlaying: {current: false},
			audioAndVideoTags: {current: []},
		}),
		[currentFrame],
	);

	return (
		<LogLevelContext.Provider value={logContext}>
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
		</LogLevelContext.Provider>
	);
};

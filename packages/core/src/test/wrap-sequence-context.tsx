import React, {useContext} from 'react';
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

const mockCompositionContext: CompositionManagerContext = {
	compositions: [
		{
			id: 'my-comp',
			durationInFrames: 1000000,
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
		durationInFrames: 1000000,
		fps: 30,
		height: 1080,
		width: 1080,
		props: {},
	},
};

const logContext: LoggingContextValue = {
	logLevel: 'info',
	mountTime: 0,
};

const mockTimelineContext: TimelineContextValue = {
	frame: {},
	playing: false,
	rootId: 'test-root',
	imperativePlaying: {current: false},
	audioAndVideoTags: {current: []},
};

const mockPlaybackRateContext: PlaybackRateContextValue = {
	playbackRate: 1,
	setPlaybackRate: () => {
		throw new Error('not implemented');
	},
};

const MaybeTimelineProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const existing = useContext(TimelineContext);
	if (existing !== null) {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		return <>{children}</>;
	}

	return (
		<AbsoluteTimeContext.Provider value={mockTimelineContext}>
			<TimelineContext.Provider value={mockTimelineContext}>
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
}> = ({children}) => {
	return (
		<LogLevelContext.Provider value={logContext}>
			<BufferingProvider>
				<CanUseRemotionHooksProvider>
					<MaybeTimelineProvider>
						<MaybePlaybackRateProvider>
							<SequenceManagerProvider visualModeEnabled={false}>
								<CompositionManager.Provider value={mockCompositionContext}>
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

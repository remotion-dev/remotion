import React, {useContext} from 'react';
import {BufferingProvider} from '../buffering.js';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import type {CompositionManagerContext} from '../CompositionManagerContext.js';
import {CompositionManager} from '../CompositionManagerContext.js';
import type {LoggingContextValue} from '../log-level-context.js';
import {LogLevelContext} from '../log-level-context.js';
import type {TimelineContextValue} from '../TimelineContext.js';
import {AbsoluteTimeContext, TimelineContext} from '../TimelineContext.js';

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
		},
	],
	folders: [],
	canvasContent: {type: 'composition', compositionId: 'my-comp'},
	currentCompositionMetadata: {
		defaultCodec: null,
		defaultOutName: null,
		defaultPixelFormat: null,
		defaultProResProfile: null,
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
	playbackRate: 1,
	rootId: 'test-root',
	imperativePlaying: {current: false},
	setPlaybackRate: () => {
		throw new Error('not implemented');
	},
	audioAndVideoTags: {current: []},
};

const MaybeTimelineProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const existing = useContext(TimelineContext);
	if (existing !== null) {
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

export const WrapSequenceContext: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<LogLevelContext.Provider value={logContext}>
			<BufferingProvider>
				<CanUseRemotionHooksProvider>
					<MaybeTimelineProvider>
						<CompositionManager.Provider value={mockCompositionContext}>
							{children}
						</CompositionManager.Provider>
					</MaybeTimelineProvider>
				</CanUseRemotionHooksProvider>
			</BufferingProvider>
		</LogLevelContext.Provider>
	);
};

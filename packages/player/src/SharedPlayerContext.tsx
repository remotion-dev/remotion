// Contexts shared between <Player> and <Thumbnail>

import type {ComponentType, LazyExoticComponent} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import type {
	CompositionManagerContext,
	LoggingContextValue,
	LogLevel,
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
	TimelineContextValue,
} from 'remotion';
import {Internals} from 'remotion';
import {getPreferredVolume, persistVolume} from './volume-persistance.js';

export const PLAYER_COMP_ID = 'player-comp';

export const SharedPlayerContexts: React.FC<{
	readonly children: React.ReactNode;
	readonly timelineContext: TimelineContextValue;
	readonly fps: number;
	readonly compositionWidth: number;
	readonly compositionHeight: number;
	readonly durationInFrames: number;
	readonly component: LazyExoticComponent<ComponentType<unknown>>;
	readonly numberOfSharedAudioTags: number;
	readonly initiallyMuted: boolean;
	readonly logLevel: LogLevel;
}> = ({
	children,
	timelineContext,
	fps,
	compositionHeight,
	compositionWidth,
	durationInFrames,
	component,
	numberOfSharedAudioTags,
	initiallyMuted,
	logLevel,
}) => {
	const compositionManagerContext: CompositionManagerContext = useMemo(() => {
		const context: CompositionManagerContext = {
			compositions: [
				{
					component: component as React.LazyExoticComponent<
						ComponentType<unknown>
					>,
					durationInFrames,
					height: compositionHeight,
					width: compositionWidth,
					fps,
					id: PLAYER_COMP_ID,
					nonce: 777,
					folderName: null,
					parentFolderName: null,
					schema: null,
					calculateMetadata: null,
				},
			],
			folders: [],
			registerFolder: () => undefined,
			unregisterFolder: () => undefined,
			registerComposition: () => undefined,
			unregisterComposition: () => undefined,
			currentCompositionMetadata: null,
			setCurrentCompositionMetadata: () => undefined,
			canvasContent: {type: 'composition', compositionId: 'player-comp'},
			setCanvasContent: () => undefined,
			updateCompositionDefaultProps: () => undefined,
		};
		return context;
	}, [component, durationInFrames, compositionHeight, compositionWidth, fps]);

	const [mediaMuted, setMediaMuted] = useState<boolean>(() => initiallyMuted);
	const [mediaVolume, setMediaVolume] = useState<number>(() =>
		getPreferredVolume(),
	);

	const mediaVolumeContextValue = useMemo((): MediaVolumeContextValue => {
		return {
			mediaMuted,
			mediaVolume,
		};
	}, [mediaMuted, mediaVolume]);

	const setMediaVolumeAndPersist = useCallback(
		(vol: number) => {
			setMediaVolume(vol);
			persistVolume(vol, logLevel);
		},
		[logLevel],
	);

	const setMediaVolumeContextValue = useMemo((): SetMediaVolumeContextValue => {
		return {
			setMediaMuted,
			setMediaVolume: setMediaVolumeAndPersist,
		};
	}, [setMediaVolumeAndPersist]);

	const logLevelContext: LoggingContextValue = useMemo(() => {
		return {
			logLevel,
			mountTime: Date.now(),
		};
	}, [logLevel]);

	return (
		<Internals.LogLevelContext.Provider value={logLevelContext}>
			<Internals.CanUseRemotionHooksProvider>
				<Internals.Timeline.TimelineContext.Provider value={timelineContext}>
					<Internals.CompositionManager.Provider
						value={compositionManagerContext}
					>
						<Internals.ResolveCompositionConfig>
							<Internals.PrefetchProvider>
								<Internals.DurationsContextProvider>
									<Internals.MediaVolumeContext.Provider
										value={mediaVolumeContextValue}
									>
										<Internals.SetMediaVolumeContext.Provider
											value={setMediaVolumeContextValue}
										>
											<Internals.SharedAudioContextProvider
												numberOfAudioTags={numberOfSharedAudioTags}
												component={component}
											>
												<Internals.BufferingProvider>
													{children}
												</Internals.BufferingProvider>
											</Internals.SharedAudioContextProvider>
										</Internals.SetMediaVolumeContext.Provider>
									</Internals.MediaVolumeContext.Provider>
								</Internals.DurationsContextProvider>
							</Internals.PrefetchProvider>
						</Internals.ResolveCompositionConfig>
					</Internals.CompositionManager.Provider>
				</Internals.Timeline.TimelineContext.Provider>
			</Internals.CanUseRemotionHooksProvider>
		</Internals.LogLevelContext.Provider>
	);
};

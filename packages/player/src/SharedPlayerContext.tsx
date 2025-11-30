// Contexts shared between <Player> and <Thumbnail>

import type {ComponentType, LazyExoticComponent} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import type {
	CompositionManagerContext,
	LoggingContextValue,
	LogLevel,
	MediaVolumeContextValue,
	RemotionEnvironment,
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
	readonly audioLatencyHint: AudioContextLatencyCategory;
	readonly volumePersistenceKey?: string;
	readonly inputProps: Record<string, unknown>;
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
	audioLatencyHint,
	volumePersistenceKey,
	inputProps,
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
			currentCompositionMetadata: {
				defaultCodec: null,
				defaultOutName: null,
				defaultPixelFormat: null,
				defaultProResProfile: null,
				defaultVideoImageFormat: null,
				durationInFrames,
				fps,
				height: compositionHeight,
				width: compositionWidth,
				props: inputProps,
			},
			canvasContent: {type: 'composition', compositionId: 'player-comp'},
		};
		return context;
	}, [
		component,
		durationInFrames,
		compositionHeight,
		compositionWidth,
		fps,
		inputProps,
	]);

	const [mediaMuted, setMediaMuted] = useState<boolean>(() => initiallyMuted);
	const [mediaVolume, setMediaVolume] = useState<number>(() =>
		getPreferredVolume(volumePersistenceKey ?? null),
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
			persistVolume(vol, logLevel, volumePersistenceKey ?? null);
		},
		[logLevel, volumePersistenceKey],
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

	const env: RemotionEnvironment = useMemo(() => {
		return {
			isPlayer: true,
			isRendering: false,
			isStudio: false,
			isClientSideRendering: false,
			isReadOnlyStudio: false,
		};
	}, []);

	return (
		<Internals.RemotionEnvironmentContext.Provider value={env}>
			<Internals.LogLevelContext.Provider value={logLevelContext}>
				<Internals.CanUseRemotionHooksProvider>
					<Internals.TimelineContext.Provider value={timelineContext}>
						<Internals.CompositionManager.Provider
							value={compositionManagerContext}
						>
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
												audioLatencyHint={audioLatencyHint}
											>
												<Internals.BufferingProvider>
													{children}
												</Internals.BufferingProvider>
											</Internals.SharedAudioContextProvider>
										</Internals.SetMediaVolumeContext.Provider>
									</Internals.MediaVolumeContext.Provider>
								</Internals.DurationsContextProvider>
							</Internals.PrefetchProvider>
						</Internals.CompositionManager.Provider>
					</Internals.TimelineContext.Provider>
				</Internals.CanUseRemotionHooksProvider>
			</Internals.LogLevelContext.Provider>
		</Internals.RemotionEnvironmentContext.Provider>
	);
};

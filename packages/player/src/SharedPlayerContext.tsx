// Contexts shared between <Player> and <Thumbnail>

import type {ComponentType, LazyExoticComponent} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import type {
	CompositionManagerContext,
	LoggingContextValue,
	LogLevel,
	MediaVolumeContextValue,
	PlaybackRateContextValue,
	RemotionEnvironment,
	SetMediaVolumeContextValue,
	TimelineContextValue,
} from 'remotion';
import {Internals} from 'remotion';
import {getPreferredVolume, persistVolume} from './volume-persistence.js';

export const PLAYER_COMP_ID = 'player-comp';

export const SharedPlayerContexts: React.FC<{
	readonly children: React.ReactNode;
	readonly timelineContext: TimelineContextValue;
	readonly playbackRateContext: PlaybackRateContextValue;
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
	readonly initialVolume?: number;
	readonly inputProps: Record<string, unknown>;
	readonly audioEnabled: boolean;
}> = ({
	children,
	timelineContext,
	playbackRateContext,
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
	initialVolume,
	inputProps,
	audioEnabled,
}) => {
	const persistVolumeToStorage = initialVolume === undefined;
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
					nonce: [[0, 777]],
					folderName: null,
					parentFolderName: null,
					schema: null,
					calculateMetadata: null,
					stack: null,
				},
			],
			folders: [],
			currentCompositionMetadata: {
				defaultCodec: null,
				defaultOutName: null,
				defaultPixelFormat: null,
				defaultProResProfile: null,
				defaultSampleRate: null,
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
		persistVolumeToStorage
			? getPreferredVolume(volumePersistenceKey ?? null)
			: initialVolume,
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
			if (persistVolumeToStorage) {
				persistVolume(vol, logLevel, volumePersistenceKey ?? null);
			}
		},
		[persistVolumeToStorage, logLevel, volumePersistenceKey],
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
					<Internals.AbsoluteTimeContext.Provider value={timelineContext}>
						<Internals.PlaybackRateContext.Provider value={playbackRateContext}>
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
													<Internals.BufferingProvider>
														<Internals.SharedAudioContextProvider
															audioLatencyHint={audioLatencyHint}
															audioEnabled={audioEnabled}
														>
															<Internals.SharedAudioTagsContextProvider
																numberOfAudioTags={numberOfSharedAudioTags}
															>
																{children}
															</Internals.SharedAudioTagsContextProvider>
														</Internals.SharedAudioContextProvider>
													</Internals.BufferingProvider>
												</Internals.SetMediaVolumeContext.Provider>
											</Internals.MediaVolumeContext.Provider>
										</Internals.DurationsContextProvider>
									</Internals.PrefetchProvider>
								</Internals.CompositionManager.Provider>
							</Internals.TimelineContext.Provider>
						</Internals.PlaybackRateContext.Provider>
					</Internals.AbsoluteTimeContext.Provider>
				</Internals.CanUseRemotionHooksProvider>
			</Internals.LogLevelContext.Provider>
		</Internals.RemotionEnvironmentContext.Provider>
	);
};

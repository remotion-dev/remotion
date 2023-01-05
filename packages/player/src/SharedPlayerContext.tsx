// Contexts shared between <Player> and <Thumbnail>

import React, {useCallback, useMemo, useState} from 'react';
import type {
	CompositionManagerContext,
	Layer,
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
	TimelineContextValue,
} from 'remotion';
import {Internals} from 'remotion';
import {getPreferredVolume, persistVolume} from './volume-persistance';

// eslint-disable-next-line react/function-component-definition
export function SharedPlayerContexts<T>({
	children,
	timelineContext,
	inputProps,
	fps,
	compositionHeight,
	compositionWidth,
	durationInFrames,
	layers,
	numberOfSharedAudioTags,
}: {
	children: React.ReactNode;
	timelineContext: TimelineContextValue;
	inputProps?: T;
	fps: number;
	compositionWidth: number;
	compositionHeight: number;
	durationInFrames: number;
	layers: Layer<T>[];
	numberOfSharedAudioTags: number;
}) {
	const compositionManagerContext: CompositionManagerContext = useMemo(() => {
		return {
			compositions: [
				{
					layers: layers as Layer<unknown>[],
					durationInFrames,
					height: compositionHeight,
					width: compositionWidth,
					fps,
					id: 'player-comp',
					props: inputProps,
					nonce: 777,
					scale: 1,
					folderName: null,
					defaultProps: undefined,
					parentFolderName: null,
				},
			],
			folders: [],
			registerFolder: () => undefined,
			unregisterFolder: () => undefined,
			currentComposition: 'player-comp',
			registerComposition: () => undefined,
			registerSequence: () => undefined,
			sequences: [],
			setCurrentComposition: () => undefined,
			unregisterComposition: () => undefined,
			unregisterSequence: () => undefined,
			registerAsset: () => undefined,
			unregisterAsset: () => undefined,
			currentCompositionMetadata: null,
			setCurrentCompositionMetadata: () => undefined,
			assets: [],
			setClipRegion: () => undefined,
		};
	}, [
		layers,
		durationInFrames,
		compositionHeight,
		compositionWidth,
		fps,
		inputProps,
	]);

	const [mediaMuted, setMediaMuted] = useState<boolean>(false);
	const [mediaVolume, setMediaVolume] = useState<number>(getPreferredVolume());

	const mediaVolumeContextValue = useMemo((): MediaVolumeContextValue => {
		return {
			mediaMuted,
			mediaVolume,
		};
	}, [mediaMuted, mediaVolume]);

	const setMediaVolumeAndPersist = useCallback((vol: number) => {
		setMediaVolume(vol);
		persistVolume(vol);
	}, []);

	const setMediaVolumeContextValue = useMemo((): SetMediaVolumeContextValue => {
		return {
			setMediaMuted,
			setMediaVolume: setMediaVolumeAndPersist,
		};
	}, [setMediaVolumeAndPersist]);

	return (
		<Internals.CanUseRemotionHooksProvider>
			<Internals.Timeline.TimelineContext.Provider value={timelineContext}>
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
									>
										{children}
									</Internals.SharedAudioContextProvider>
								</Internals.SetMediaVolumeContext.Provider>
							</Internals.MediaVolumeContext.Provider>
						</Internals.DurationsContextProvider>
					</Internals.PrefetchProvider>
				</Internals.CompositionManager.Provider>
			</Internals.Timeline.TimelineContext.Provider>
		</Internals.CanUseRemotionHooksProvider>
	);
}

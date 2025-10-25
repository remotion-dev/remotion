import type {InputAudioTrack, InputVideoTrack} from 'mediabunny';
import React from 'react';
import {
	getActualAudioOperation,
	getActualVideoOperation,
} from '~/lib/get-audio-video-config-index';
import {getAudioOperationId, getVideoOperationId} from '~/lib/operation-key';
import {renderHumanReadableContainer} from '~/lib/render-codec-label';
import {outputContainers, type OutputContainer} from '~/seo';
import {AudioCodecSelection} from './AudioCodecSelection';
import type {SupportedConfigs} from './get-supported-configs';
import {SelectionSkeleton} from './SelectionSkeleton';
import {AudioTrackLabel, VideoTrackLabel} from './TrackSelectionLabels';
import {Label} from './ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import {VideoCodecSelection} from './VideoCodecSelection';

export const ConvertForm: React.FC<{
	readonly container: OutputContainer;
	readonly setContainer: React.Dispatch<React.SetStateAction<OutputContainer>>;
	readonly supportedConfigs: SupportedConfigs | null;
	readonly videoConfigIndexSelection: Record<number, string>;
	readonly audioConfigIndexSelection: Record<number, string>;
	readonly setAudioConfigIndex: (trackId: number, key: string) => void;
	readonly setVideoConfigIndex: (trackId: number, key: string) => void;
	readonly currentAudioCodec: InputAudioTrack['codec'] | null;
	readonly currentVideoCodec: InputVideoTrack['codec'] | null;
}> = ({
	container,
	setContainer,
	supportedConfigs,
	audioConfigIndexSelection,
	setAudioConfigIndex,
	videoConfigIndexSelection,
	setVideoConfigIndex,
	currentAudioCodec,
	currentVideoCodec,
}) => {
	return (
		<div className="gap-4 grid">
			<div>
				<Label htmlFor="container">Container</Label>
				<Select
					value={container}
					onValueChange={(v) => setContainer(v as OutputContainer)}
				>
					<SelectTrigger id="container">
						<SelectValue placeholder="Select a container" />
					</SelectTrigger>
					<SelectContent>
						{outputContainers.map((availableContainer) => {
							return (
								<SelectGroup key={availableContainer}>
									<SelectItem value={availableContainer}>
										{renderHumanReadableContainer(availableContainer)}
									</SelectItem>
								</SelectGroup>
							);
						})}
					</SelectContent>
				</Select>
			</div>
			{supportedConfigs ? (
				supportedConfigs.videoTrackOptions.map((track) => {
					return (
						<div key={track.trackId}>
							<VideoTrackLabel
								trackId={track.trackId}
								totalVideoTracks={supportedConfigs.videoTrackOptions.length}
							/>
							<VideoCodecSelection
								index={getVideoOperationId(
									getActualVideoOperation({
										videoConfigIndexSelection,
										enableConvert: true,
										operations: track.operations,
										trackNumber: track.trackId,
									}),
								)}
								setIndex={(i) => {
									setVideoConfigIndex(track.trackId, i);
								}}
								videoOperations={track.operations}
								currentVideoCodec={currentVideoCodec}
							/>
						</div>
					);
				})
			) : (
				<SelectionSkeleton />
			)}
			{supportedConfigs ? (
				supportedConfigs.audioTrackOptions.map((track) => {
					return (
						<div key={track.trackId}>
							<AudioTrackLabel
								trackId={track.trackId}
								totalAudioTracks={supportedConfigs.audioTrackOptions.length}
								audioCodec={track.audioCodec}
							/>
							<AudioCodecSelection
								index={getAudioOperationId(
									getActualAudioOperation({
										audioConfigIndexSelection,
										enableConvert: true,
										operations: track.operations,
										trackNumber: track.trackId,
									}),
								)}
								setIndex={(i) => {
									setAudioConfigIndex(track.trackId, i);
								}}
								audioTrackOptions={track.operations}
								currentAudioCodec={currentAudioCodec}
							/>
						</div>
					);
				})
			) : (
				<SelectionSkeleton />
			)}
		</div>
	);
};

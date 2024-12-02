import {
	MediaParserAudioCodec,
	MediaParserVideoCodec,
} from '@remotion/media-parser';
import {
	ConvertMediaContainer,
	getAvailableContainers,
} from '@remotion/webcodecs';
import React from 'react';
import {renderHumanReadableContainer} from '~/lib/render-codec-label';
import {AudioCodecSelection} from './AudioCodecSelection';
import {SupportedConfigs} from './get-supported-configs';
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
	readonly container: ConvertMediaContainer;
	readonly setContainer: React.Dispatch<
		React.SetStateAction<ConvertMediaContainer>
	>;
	readonly supportedConfigs: SupportedConfigs | null;
	readonly videoConfigIndexSelection: Record<number, number>;
	readonly audioConfigIndexSelection: Record<number, number>;
	readonly setAudioConfigIndex: (trackId: number, i: number) => void;
	readonly setVideoConfigIndex: (trackId: number, i: number) => void;
	readonly currentAudioCodec: MediaParserAudioCodec | null;
	readonly currentVideoCodec: MediaParserVideoCodec | null;
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
					onValueChange={(v) => setContainer(v as ConvertMediaContainer)}
				>
					<SelectTrigger id="container">
						<SelectValue placeholder="Select a container" />
					</SelectTrigger>
					<SelectContent>
						{getAvailableContainers().map((container) => {
							return (
								<SelectGroup key={container}>
									<SelectItem value={container}>
										{renderHumanReadableContainer(container)}
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
								index={videoConfigIndexSelection[track.trackId] ?? 0}
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
							/>
							<AudioCodecSelection
								index={audioConfigIndexSelection[track.trackId] ?? 0}
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

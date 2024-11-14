import {
	MediaParserAudioCodec,
	MediaParserVideoCodec,
} from '@remotion/media-parser';
import {ConvertMediaContainer} from '@remotion/webcodecs';
import React from 'react';
import {AudioCodecSelection} from './AudioCodecSelection';
import {SupportedConfigs} from './get-supported-configs';
import {SelectionSkeleton} from './SelectionSkeleton';
import {AudioTrackLabel, VideoTrackLabel} from './TrackSelectionLabels';
import {Checkbox} from './ui/checkbox';
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
	readonly flipHorizontal: boolean;
	readonly setFlipHorizontal: React.Dispatch<React.SetStateAction<boolean>>;
	readonly flipVertical: boolean;
	readonly setFlipVertical: React.Dispatch<React.SetStateAction<boolean>>;
	readonly supportedConfigs: SupportedConfigs | null;
	readonly videoConfigIndex: Record<number, number>;
	readonly audioConfigIndex: Record<number, number>;
	readonly setAudioConfigIndex: (trackId: number, i: number) => void;
	readonly setVideoConfigIndex: (trackId: number, i: number) => void;
	readonly currentAudioCodec: MediaParserAudioCodec | null;
	readonly currentVideoCodec: MediaParserVideoCodec | null;
}> = ({
	container,
	setContainer,
	flipHorizontal,
	flipVertical,
	setFlipHorizontal,
	setFlipVertical,
	supportedConfigs,
	audioConfigIndex,
	setAudioConfigIndex,
	videoConfigIndex,
	setVideoConfigIndex,
	currentAudioCodec,
	currentVideoCodec,
}) => {
	const [showAdvanced, setShowAdvanced] = React.useState(false);

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
						<SelectGroup>
							<SelectItem value="webm">WebM</SelectItem>
						</SelectGroup>
						<SelectGroup>
							<SelectItem value="mp4">MP4</SelectItem>
						</SelectGroup>
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
								index={videoConfigIndex[track.trackId] ?? 0}
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
								index={audioConfigIndex[track.trackId] ?? 0}
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
			{showAdvanced ? (
				<>
					<div className="flex flex-row">
						<Checkbox
							checked={flipHorizontal}
							id="flipHorizontal"
							onCheckedChange={() => setFlipHorizontal((e) => !e)}
						/>
						<div className="w-2" />
						<div className="grid gap-1.5 leading-none">
							<label
								htmlFor="flipHorizontal"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Flip video horizontally
							</label>
						</div>
					</div>
					<div className="flex flex-row">
						<Checkbox
							checked={flipVertical}
							id="flipVertical"
							onCheckedChange={() => setFlipVertical((e) => !e)}
						/>
						<div className="w-2" />
						<div className="grid gap-1.5 leading-none">
							<label
								htmlFor="flipVertical"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Flip video vertically
							</label>
						</div>
					</div>
				</>
			) : (
				<div className="flex flex-row justify-center text-muted-foreground">
					<button
						type="button"
						className="font-brand"
						onClick={() => setShowAdvanced(true)}
					>
						Advanced settings
					</button>
				</div>
			)}
		</div>
	);
};

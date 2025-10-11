import type {MediaParserAudioCodec} from '@remotion/media-parser';
import React from 'react';
import {renderHumanReadableAudioCodec} from '~/lib/render-codec-label';
import {Label} from './ui/label';

export const VideoTrackLabel: React.FC<{
	readonly trackId: number;
	readonly totalVideoTracks: number;
}> = ({trackId, totalVideoTracks}) => {
	if (totalVideoTracks === 1) {
		return <Label htmlFor="videoCodec">Video Codec</Label>;
	}

	return <Label htmlFor="videoCodec">Video Codec for track {trackId}</Label>;
};

export const AudioTrackLabel: React.FC<{
	readonly trackId: number;
	readonly totalAudioTracks: number;
	readonly audioCodec: MediaParserAudioCodec;
}> = ({trackId, totalAudioTracks, audioCodec}) => {
	if (totalAudioTracks === 1) {
		return <Label htmlFor="audioCodec">Audio Codec</Label>;
	}

	return (
		<Label htmlFor="audioCodec">
			Audio Codec for track {trackId} (
			{renderHumanReadableAudioCodec(audioCodec)})
		</Label>
	);
};

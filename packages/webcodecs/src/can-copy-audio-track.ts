import type {
	MediaParserAudioCodec,
	MediaParserContainer,
} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import type {ConvertMediaContainer} from './get-available-containers';
import {isSameAudioCodec} from './is-different-video-codec';

export const canCopyAudioTrack = ({
	inputCodec,
	outputContainer,
	inputContainer,
	outputAudioCodec,
}: {
	inputCodec: MediaParserAudioCodec;
	outputContainer: ConvertMediaContainer;
	inputContainer: MediaParserContainer;
	outputAudioCodec: ConvertMediaAudioCodec | null;
}) => {
	if (outputAudioCodec) {
		if (
			!isSameAudioCodec({
				inputAudioCodec: inputCodec,
				outputCodec: outputAudioCodec,
			})
		) {
			return false;
		}
	}

	if (outputContainer === 'webm') {
		return inputCodec === 'opus';
	}

	if (outputContainer === 'mp4') {
		return (
			inputCodec === 'aac' &&
			(inputContainer === 'mp4' ||
				inputContainer === 'avi' ||
				inputContainer === 'm3u8')
		);
	}

	if (outputContainer === 'wav') {
		return false;
	}

	throw new Error(`Unhandled container: ${outputContainer satisfies never}`);
};

import type {InputFormat, InputTrack} from 'mediabunny';
import type {SupportedConfigs} from '~/components/get-supported-configs';
import type {OutputContainer} from '~/seo';
import {
	getActualAudioOperation,
	getActualVideoOperation,
} from './get-audio-video-config-index';
import {getSameOutputFormat} from './get-default-output-format';

const getInputVideoCodec = (tracks: InputTrack[], trackId: number) => {
	for (const track of tracks) {
		if (track.id === trackId && track.isVideoTrack()) {
			return track.codec;
		}
	}

	return null;
};

const getInputAudioCodec = (tracks: InputTrack[], trackId: number) => {
	for (const track of tracks) {
		if (track.id === trackId && track.isAudioTrack()) {
			return track.codec;
		}
	}

	return null;
};

export const getConvertActionLabel = ({
	audioConfigIndexSelection,
	enableConvert,
	inputContainer,
	outputContainer,
	supportedConfigs,
	tracks,
	videoConfigIndexSelection,
}: {
	readonly audioConfigIndexSelection: Record<number, string>;
	readonly enableConvert: boolean;
	readonly inputContainer: InputFormat;
	readonly outputContainer: OutputContainer;
	readonly supportedConfigs: SupportedConfigs | null;
	readonly tracks: InputTrack[] | null;
	readonly videoConfigIndexSelection: Record<number, string>;
}): 'Convert' | 'Remux' | 'Re-encode' => {
	if (!enableConvert || supportedConfigs === null || tracks === null) {
		return 'Convert';
	}

	if (getSameOutputFormat(inputContainer) !== outputContainer) {
		return 'Convert';
	}

	let hasReencodeOperation = false;
	let hasTrackOperation = false;

	for (const option of supportedConfigs.videoTrackOptions) {
		const operation = getActualVideoOperation({
			enableConvert,
			trackNumber: option.trackId,
			videoConfigIndexSelection,
			operations: option.operations,
		});

		if (operation.type === 'copy' || operation.type === 'drop') {
			hasTrackOperation = true;
			continue;
		}

		if (operation.type !== 'reencode') {
			return 'Convert';
		}

		const inputVideoCodec = getInputVideoCodec(tracks, option.trackId);
		if (inputVideoCodec !== operation.videoCodec) {
			return 'Convert';
		}

		hasTrackOperation = true;
		hasReencodeOperation = true;
	}

	for (const option of supportedConfigs.audioTrackOptions) {
		const operation = getActualAudioOperation({
			audioConfigIndexSelection,
			enableConvert,
			trackNumber: option.trackId,
			operations: option.operations,
		});

		if (operation.type === 'copy' || operation.type === 'drop') {
			hasTrackOperation = true;
			continue;
		}

		if (operation.type !== 'reencode') {
			return 'Convert';
		}

		const inputAudioCodec = getInputAudioCodec(tracks, option.trackId);
		if (inputAudioCodec !== operation.audioCodec) {
			return 'Convert';
		}

		hasTrackOperation = true;
		hasReencodeOperation = true;
	}

	if (hasReencodeOperation) {
		return 'Re-encode';
	}

	return hasTrackOperation ? 'Remux' : 'Convert';
};

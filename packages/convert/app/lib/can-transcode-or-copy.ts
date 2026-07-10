import type {
	AudioCodec,
	InputAudioTrack,
	InputVideoTrack,
	OutputFormat,
} from 'mediabunny';
import {getEncodableAudioCodecs, getEncodableVideoCodecs} from 'mediabunny';
import type {AudioOperation, VideoOperation} from './audio-operation';
import {
	calculateNewDimensionsFromRotateAndScale,
	normalizeVideoRotation,
} from './calculate-new-dimensions-from-dimensions';
import type {MediabunnyResize} from './mediabunny-calculate-resize-option';
import {ensureAudioEncoderRegistered} from './register-audio-encoder';

const canEncodeAudioCodec = async ({
	codec,
	sampleRate,
	allowFallbackSampleRate,
}: {
	codec: AudioCodec;
	sampleRate: number;
	allowFallbackSampleRate: boolean;
}) => {
	await ensureAudioEncoderRegistered(codec);

	const codecs = await getEncodableAudioCodecs([codec], {sampleRate});
	if (codecs.includes(codec)) {
		return true;
	}

	if (!allowFallbackSampleRate) {
		return false;
	}

	const codecsWithDefaultParams = await getEncodableAudioCodecs([codec]);
	return codecsWithDefaultParams.includes(codec);
};

export const getAudioTranscodingOptions = async ({
	inputTrack,
	outputContainer,
	sampleRate,
}: {
	inputTrack: InputAudioTrack;
	outputContainer: OutputFormat;
	sampleRate: number | null;
}): Promise<AudioOperation[]> => {
	const inputAudioCodec = await inputTrack.getCodec();
	if (inputAudioCodec === null) {
		return [];
	}

	if (!(await inputTrack.canDecode())) {
		return [];
	}

	const supportedCodecsByContainer = outputContainer.getSupportedAudioCodecs();

	const configs: AudioOperation[] = [];
	const inputSampleRate = await inputTrack.getSampleRate();
	const audioEncoderSampleRate = sampleRate ?? inputSampleRate;

	for (const codec of supportedCodecsByContainer) {
		const canEncode = await canEncodeAudioCodec({
			codec,
			sampleRate: audioEncoderSampleRate,
			allowFallbackSampleRate: sampleRate === null,
		});

		if (canEncode) {
			configs.push({
				type: 'reencode',
				audioCodec: codec,
				sampleRate,
			});
		}
	}

	return configs;
};

export const getVideoTranscodingOptions = async ({
	inputTrack,
	outputContainer,
	resizeOperation,
	rotate,
}: {
	inputTrack: InputVideoTrack;
	outputContainer: OutputFormat;
	resizeOperation: MediabunnyResize | null;
	rotate: number | null;
}): Promise<VideoOperation[]> => {
	const inputVideoCodec = await inputTrack.getCodec();
	if (inputVideoCodec === null) {
		return [];
	}

	if (!(await inputTrack.canDecode())) {
		return [];
	}

	const {height, width} = calculateNewDimensionsFromRotateAndScale({
		height: inputTrack.displayHeight,
		resizeOperation,
		rotation: rotate ?? 0,
		needsToBeMultipleOfTwo: inputVideoCodec === 'avc',
		width: inputTrack.displayWidth,
	});

	const supportedCodecsByContainer = outputContainer.getSupportedVideoCodecs();

	const configs: VideoOperation[] = [];
	for (const codec of supportedCodecsByContainer) {
		const codecs = await getEncodableVideoCodecs([codec], {
			height,
			width,
		});

		if (codecs.includes(codec)) {
			configs.push({
				type: 'reencode',
				videoCodec: codec,
				resize: resizeOperation,
				rotate: rotate ?? undefined,
			});
		}
	}

	return configs;
};

export const canCopyVideoTrack = async ({
	outputContainer,
	rotationToApply,
	resizeOperation,
	inputTrack,
}: {
	inputTrack: InputVideoTrack;
	rotationToApply: number;
	outputContainer: OutputFormat;
	resizeOperation: MediabunnyResize | null;
}) => {
	const inputVideoCodec = await inputTrack.getCodec();
	if (!inputVideoCodec) {
		return false;
	}

	if (
		normalizeVideoRotation(inputTrack.rotation) !==
		normalizeVideoRotation(rotationToApply)
	) {
		return false;
	}

	const needsToBeMultipleOfTwo =
		inputVideoCodec === 'avc' || inputVideoCodec === 'hevc';

	const newDimensions = calculateNewDimensionsFromRotateAndScale({
		height: inputTrack.displayHeight,
		resizeOperation,
		rotation: rotationToApply,
		width: inputTrack.displayWidth,
		needsToBeMultipleOfTwo,
	});
	if (
		newDimensions.height !== inputTrack.displayHeight ||
		newDimensions.width !== inputTrack.displayWidth
	) {
		return false;
	}

	return outputContainer.getSupportedCodecs().includes(inputVideoCodec);
};

export const canCopyAudioTrack = async ({
	inputTrack,
	outputContainer,
	sampleRate,
}: {
	inputTrack: InputAudioTrack;
	outputContainer: OutputFormat;
	sampleRate: number | null;
}) => {
	const inputAudioCodec = await inputTrack.getCodec();
	if (!inputAudioCodec) {
		return false;
	}

	if (sampleRate && (await inputTrack.getSampleRate()) !== sampleRate) {
		return false;
	}

	return outputContainer.getSupportedCodecs().includes(inputAudioCodec);
};

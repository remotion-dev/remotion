import type {InputAudioTrack, InputVideoTrack, OutputFormat} from 'mediabunny';
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
	codec: InputAudioTrack['codec'];
	sampleRate: number;
	allowFallbackSampleRate: boolean;
}) => {
	if (codec === null) {
		return false;
	}

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
	if (inputTrack.codec === null) {
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
	if (inputTrack.codec === null) {
		return [];
	}

	if (!(await inputTrack.canDecode())) {
		return [];
	}

	const {height, width} = calculateNewDimensionsFromRotateAndScale({
		height: inputTrack.displayHeight,
		resizeOperation,
		rotation: rotate ?? 0,
		needsToBeMultipleOfTwo: inputTrack.codec === 'avc',
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

export const canCopyVideoTrack = ({
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
	if (
		normalizeVideoRotation(inputTrack.rotation) !==
		normalizeVideoRotation(rotationToApply)
	) {
		return false;
	}

	if (!inputTrack.codec) {
		return false;
	}

	const needsToBeMultipleOfTwo =
		inputTrack.codec === 'avc' || inputTrack.codec === 'hevc';

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

	return outputContainer.getSupportedCodecs().includes(inputTrack.codec);
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
	if (!inputTrack.codec) {
		return false;
	}

	if (sampleRate && (await inputTrack.getSampleRate()) !== sampleRate) {
		return false;
	}

	return outputContainer.getSupportedCodecs().includes(inputTrack.codec);
};

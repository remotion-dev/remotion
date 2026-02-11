import {canEncodeAudio, type Quality} from 'mediabunny';
import type {CanRenderIssue} from './can-render-types';
import {
	audioCodecToMediabunnyAudioCodec,
	getDefaultAudioCodecForContainer,
	getSupportedAudioCodecsForContainer,
	type WebRendererAudioCodec,
	type WebRendererContainer,
} from './mediabunny-mappings';

export type ResolveAudioCodecResult = {
	codec: WebRendererAudioCodec | null;
	issues: CanRenderIssue[];
};

export const resolveAudioCodec = async (options: {
	container: WebRendererContainer;
	requestedCodec: WebRendererAudioCodec | null | undefined;
	userSpecifiedAudioCodec: boolean;
	bitrate: number | Quality;
}): Promise<ResolveAudioCodecResult> => {
	const issues: CanRenderIssue[] = [];
	const {container, requestedCodec, userSpecifiedAudioCodec, bitrate} = options;

	const audioCodec =
		requestedCodec ?? getDefaultAudioCodecForContainer(container);

	const supportedAudioCodecs = getSupportedAudioCodecsForContainer(container);

	if (!supportedAudioCodecs.includes(audioCodec)) {
		issues.push({
			type: 'audio-codec-unsupported',
			message: `Audio codec "${audioCodec}" is not supported for container "${container}". Supported: ${supportedAudioCodecs.join(', ')}`,
			severity: 'error',
		});

		return {codec: null, issues};
	}

	const mediabunnyAudioCodec = audioCodecToMediabunnyAudioCodec(audioCodec);
	const canEncode = await canEncodeAudio(mediabunnyAudioCodec, {bitrate});

	// Firefox produces bad audio with AAC, even if it says it supports it.
	const isFirefox =
		typeof navigator !== 'undefined' &&
		navigator.userAgent.toLowerCase().includes('firefox');
	if (isFirefox && audioCodec === 'aac') {
		if (userSpecifiedAudioCodec) {
			issues.push({
				type: 'audio-codec-unsupported',
				message: `Audio codec "${audioCodec}" cannot be encoded by this browser. This is common for AAC on Firefox. Try using "opus" instead.`,
				severity: 'error',
			});

			return {codec: null, issues};
		}

		issues.push({
			type: 'audio-codec-unsupported',
			message: `Falling back from audio codec "aac" to "opus" on Firefox due to known quality issues.`,
			severity: 'warning',
		});

		return {codec: 'opus', issues};
	}

	if (canEncode) {
		return {codec: audioCodec, issues};
	}

	for (const fallbackCodec of supportedAudioCodecs) {
		if (fallbackCodec !== audioCodec) {
			const fallbackMediabunnyCodec =
				audioCodecToMediabunnyAudioCodec(fallbackCodec);

			const canEncodeFallback = await canEncodeAudio(fallbackMediabunnyCodec, {
				bitrate,
			});

			if (canEncodeFallback) {
				issues.push({
					type: 'audio-codec-unsupported',
					message: `Falling back from audio codec "${audioCodec}" to "${fallbackCodec}" because the original codec cannot be encoded by this browser.`,
					severity: 'warning',
				});

				return {codec: fallbackCodec, issues};
			}
		}
	}

	issues.push({
		type: 'audio-codec-unsupported',
		message: `No audio codec can be encoded by this browser for container "${container}".`,
		severity: 'error',
	});

	return {codec: null, issues};
};

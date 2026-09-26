import type {AudioCodec} from './options/audio-codec';

// libfdk_aac (AAC-LC) prepends 2048 samples of encoder delay ("priming") to
// its output. The audio is encoded to ADTS first (compressAudio, combineAudio),
// and ADTS cannot signal that delay, so stream-copying it into an MP4 or MOV
// produced an edit list starting at media time 0: players then played the
// priming as content and the audio was 2048 / sampleRate late (42.67ms at
// 48kHz). Shifting the ADTS input back by the delay makes the muxer write an
// edit list that skips the priming, like encoding straight to MP4 does.
export const LIBFDK_AAC_LC_ENCODER_DELAY_IN_SAMPLES = 2048;

export const getAacPrimingInputArgs = ({
	audioCodec,
	sampleRate,
	outputExtension,
}: {
	audioCodec: AudioCodec | null;
	sampleRate: number;
	outputExtension: string | null;
}): string[] => {
	if (audioCodec !== 'aac') {
		return [];
	}

	// Only containers with edit lists can carry the shift
	const extension = outputExtension?.toLowerCase();
	if (extension !== 'mp4' && extension !== 'mov') {
		return [];
	}

	const delayInMicroseconds = Math.round(
		(LIBFDK_AAC_LC_ENCODER_DELAY_IN_SAMPLES / sampleRate) * 1_000_000,
	);

	return ['-itsoffset', `-${delayInMicroseconds}us`];
};

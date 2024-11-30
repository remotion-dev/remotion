import {isChrome, isFirefox} from './browser-quirks';
import type {LogLevel} from './log';
import {Log} from './log';

const overrideBrowserQuirks = ({
	config,
	logLevel,
}: {
	config: AudioDecoderConfig;
	logLevel: LogLevel;
}): AudioDecoderConfig => {
	const bytes = config.description as Uint8Array | undefined;
	if (!bytes) {
		return config;
	}

	if (bytes[0] === 18 && bytes[1] === 8) {
		// riverside_use_cursor_.mp4
		if (isFirefox()) {
			return {
				...config,
				codec: 'mp4a.40.2',
				description: bytes,
			};
		}

		if (!isChrome()) {
			return config;
		}

		Log.warn(
			logLevel,
			'Chrome has a bug and might not be able to decode this audio. It will be fixed, see: https://issues.chromium.org/issues/360083330',
		);
		return {
			...config,
			description: new Uint8Array([18, 16]),
		};
	}

	if (bytes.byteLength === 2 && bytes[0] === 17 && bytes[1] === 136) {
		Log.warn(
			logLevel,
			'Chrome has a bug and might not be able to decode this audio. It will be fixed, see: https://issues.chromium.org/issues/360083330',
		);

		return {
			...config,
			description: new Uint8Array([18, 144]),
		};
	}

	return config;
};

export const getAudioDecoderConfig = async (
	config: AudioDecoderConfig,
	logLevel: LogLevel,
): Promise<AudioDecoderConfig | null> => {
	if (config.codec === 'pcm-s16') {
		return config;
	}

	if (typeof AudioDecoder === 'undefined') {
		return null;
	}

	if (typeof EncodedAudioChunk === 'undefined') {
		return null;
	}

	const realConfig = overrideBrowserQuirks({
		config,
		logLevel,
	});

	if ((await AudioDecoder.isConfigSupported(realConfig)).supported) {
		return realConfig;
	}

	return null;
};

import type {Codec, Crf, LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {Log} from './log';

export const getCrfForCodec = ({
	crf,
	crfIsFromConfigFile,
	codec,
	indent,
	logLevel,
}: {
	crf: Crf | null;
	crfIsFromConfigFile: boolean;
	codec: Codec;
	indent: boolean;
	logLevel: LogLevel;
}): number | null => {
	if (
		crf === null ||
		crf === undefined ||
		!crfIsFromConfigFile ||
		BrowserSafeApis.codecSupportsCrf(codec)
	) {
		return crf ?? null;
	}

	Log.warn(
		{indent, logLevel},
		`The "${codec}" codec does not support CRF. Ignoring the CRF of ${crf} set in the config file.`,
	);
	return null;
};

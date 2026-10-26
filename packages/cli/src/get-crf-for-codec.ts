import type {Codec, Crf, LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {Log} from './log';

// A CRF from the config file is a project-wide default for video renders,
// so it should not break renders whose codec has no CRF (audio, ProRes, GIF).
// A CRF passed via --crf is still validated and throws for those codecs.
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
}): Crf | null => {
	if (crf === null || crf === undefined) {
		return crf;
	}

	if (!crfIsFromConfigFile || BrowserSafeApis.codecSupportsCrf(codec)) {
		return crf;
	}

	Log.info(
		{indent, logLevel},
		`The "${codec}" codec does not support a CRF. Ignoring the CRF of ${crf} set in the config file.`,
	);
	return null;
};

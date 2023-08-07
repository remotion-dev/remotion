import type {AudioCodec} from '@remotion/renderer';
import {ConfigInternals} from './config';
import {parsedCli} from './parse-command-line';

export const getResolvedAudioCodec = (): AudioCodec | null => {
	return parsedCli['audio-codec'] ?? ConfigInternals.getAudioCodec();
};

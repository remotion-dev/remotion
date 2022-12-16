import type {Frame, ParsedGif} from 'gifuct-js';
import {decompressFrame} from 'gifuct-js';

export const decompressFrames = (parsedGif: ParsedGif) => {
	return parsedGif.frames
		.filter((f) => {
			return !('application' in f);
		})
		.map((f) => {
			return decompressFrame(f as Frame, parsedGif.gct, false);
		});
};

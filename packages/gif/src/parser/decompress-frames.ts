import {decompressFrame} from '../gifuct';
import type {Frame, ParsedFrameWithoutPatch, ParsedGif} from '../gifuct/types';

export const decompressFrames = (parsedGif: ParsedGif) => {
	return parsedGif.frames
		.filter((f) => {
			return !('application' in f);
		})
		.map((f) => {
			const fr = (f as Frame).image
				? decompressFrame(f as Frame, parsedGif.gct)
				: null;
			return fr;
		})
		.filter(Boolean)
		.map((f) => f as ParsedFrameWithoutPatch);
};

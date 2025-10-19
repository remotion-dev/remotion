import type {InputFormat} from 'mediabunny';
import {Mp4InputFormat, WebMInputFormat} from 'mediabunny';
import type {OutputContainer} from '~/seo';

// TODO: Complete the list
export const getDefaultOutputFormat = (
	inputContainer: InputFormat,
): OutputContainer => {
	if (inputContainer instanceof Mp4InputFormat) {
		return 'webm';
	}

	if (inputContainer instanceof WebMInputFormat) {
		return 'mp4';
	}

	return 'mp4';
};

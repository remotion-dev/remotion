import {Mp4OutputFormat, WavOutputFormat, WebMOutputFormat} from 'mediabunny';
import type {OutputContainer} from '~/seo';

export const getMediabunnyOutput = (container: OutputContainer) => {
	if (container === 'mp4') {
		return new Mp4OutputFormat();
	}

	if (container === 'webm') {
		return new WebMOutputFormat();
	}

	if (container === 'wav') {
		return new WavOutputFormat();
	}

	throw new Error('Unsupported mime type: ' + container);
};

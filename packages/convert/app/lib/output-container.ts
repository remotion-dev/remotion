import {
	AdtsOutputFormat,
	MkvOutputFormat,
	MovOutputFormat,
	Mp3OutputFormat,
	Mp4OutputFormat,
	WavOutputFormat,
	WebMOutputFormat,
} from 'mediabunny';
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

	if (container === 'aac') {
		return new AdtsOutputFormat();
	}

	if (container === 'mkv') {
		return new MkvOutputFormat();
	}

	if (container === 'mov') {
		return new MovOutputFormat();
	}

	if (container === 'mp3') {
		return new Mp3OutputFormat();
	}

	throw new Error('Unsupported mime type: ' + (container satisfies never));
};

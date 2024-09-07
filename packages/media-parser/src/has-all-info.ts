import {hasAudioCodec} from './get-audio-codec';
import {hasDimensions} from './get-dimensions';
import {hasDuration} from './get-duration';
import {hasFps} from './get-fps';
import {hasTracks} from './get-tracks';
import {hasVideoCodec} from './get-video-codec';
import type {Options, ParseMediaFields} from './options';
import type {ParseResult} from './parse-result';
import type {ParserState} from './parser-state';

export const hasAllInfo = (
	options: Options<ParseMediaFields>,
	parseResult: ParseResult,
	state: ParserState,
) => {
	const keys = Object.entries(options)
		.filter(([, value]) => value)
		.map(([key]) => key) as (keyof Options<{
		dimensions: true;
		durationInSeconds: true;
		boxes: true;
		fps: true;
		videoCodec: true;
		audioCodec: true;
		tracks: true;
		rotation: true;
		unrotatedDimensions: true;
		internalStats: true;
		size: true;
		name: true;
	}>)[];

	return keys.every((key) => {
		if (key === 'boxes') {
			return parseResult.status === 'done';
		}

		if (key === 'durationInSeconds') {
			return hasDuration(parseResult.segments, state);
		}

		if (
			key === 'dimensions' ||
			key === 'rotation' ||
			key === 'unrotatedDimensions'
		) {
			return hasDimensions(parseResult.segments, state);
		}

		if (key === 'fps') {
			return hasFps(parseResult.segments) !== null;
		}

		if (key === 'videoCodec') {
			return hasVideoCodec(parseResult.segments);
		}

		if (key === 'audioCodec') {
			return hasAudioCodec(parseResult.segments, state);
		}

		if (key === 'tracks') {
			return hasTracks(parseResult.segments);
		}

		if (key === 'internalStats') {
			return false;
		}

		if (key === 'size') {
			return true;
		}

		if (key === 'name') {
			return true;
		}

		throw new Error(`Unknown key: ${key satisfies never}`);
	});
};

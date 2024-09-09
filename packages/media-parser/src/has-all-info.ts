import {hasAudioCodec} from './get-audio-codec';
import {hasContainer} from './get-container';
import {hasDimensions} from './get-dimensions';
import {hasDuration} from './get-duration';
import {hasFps} from './get-fps';
import {hasTracks} from './get-tracks';
import {hasVideoCodec} from './get-video-codec';
import type {Options, ParseMediaFields} from './options';
import type {ParseResult} from './parse-result';
import type {ParserState} from './parser-state';

export const getAvailableInfo = (
	options: Options<ParseMediaFields>,
	parseResult: ParseResult,
	state: ParserState,
): Record<keyof Options<ParseMediaFields>, boolean> => {
	const keys = Object.entries(options).filter(([, value]) => value) as [
		keyof Options<ParseMediaFields>,
		boolean,
	][];

	const infos = keys.map(([key]) => {
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
			return hasFps(parseResult.segments);
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

		if (key === 'container') {
			return hasContainer(parseResult.segments);
		}

		throw new Error(`Unknown key: ${key satisfies never}`);
	});

	const entries: [keyof Options<ParseMediaFields>, boolean][] = [];
	let i = 0;

	for (const [key] of keys) {
		entries.push([key, infos[i++]]);
	}

	return Object.fromEntries(entries) as Record<
		keyof Options<ParseMediaFields>,
		boolean
	>;
};

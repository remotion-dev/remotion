import {hasAudioCodec} from './get-audio-codec';
import {hasContainer} from './get-container';
import {hasDimensions} from './get-dimensions';
import {hasDuration} from './get-duration';
import {hasFps} from './get-fps';
import {hasTracks} from './get-tracks';
import {hasVideoCodec} from './get-video-codec';
import type {Options, ParseMediaFields} from './options';
import type {ParseResult, Structure} from './parse-result';
import type {ParserState} from './parser-state';

export const getAvailableInfo = (
	options: Options<ParseMediaFields>,
	parseResult: ParseResult<Structure> | null,
	state: ParserState,
): Record<keyof Options<ParseMediaFields>, boolean> => {
	const keys = Object.entries(options).filter(([, value]) => value) as [
		keyof Options<ParseMediaFields>,
		boolean,
	][];

	const infos = keys.map(([key]) => {
		if (key === 'structure') {
			return Boolean(parseResult && parseResult.status === 'done');
		}

		if (key === 'durationInSeconds') {
			return Boolean(parseResult && hasDuration(parseResult.segments, state));
		}

		if (
			key === 'dimensions' ||
			key === 'rotation' ||
			key === 'unrotatedDimensions'
		) {
			return Boolean(parseResult && hasDimensions(parseResult.segments, state));
		}

		if (key === 'fps') {
			return Boolean(parseResult && hasFps(parseResult.segments));
		}

		if (key === 'videoCodec') {
			return Boolean(parseResult && hasVideoCodec(parseResult.segments));
		}

		if (key === 'audioCodec') {
			return Boolean(parseResult && hasAudioCodec(parseResult.segments));
		}

		if (key === 'tracks') {
			return Boolean(parseResult && hasTracks(parseResult.segments));
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
			return Boolean(parseResult && hasContainer(parseResult.segments));
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

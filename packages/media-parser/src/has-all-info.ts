import {hasAudioCodec} from './get-audio-codec';
import {hasContainer} from './get-container';
import {hasDimensions} from './get-dimensions';
import {hasDuration} from './get-duration';
import {hasFps} from './get-fps';
import {hasHdr} from './get-is-hdr';
import {hasTracks} from './get-tracks';
import {hasVideoCodec} from './get-video-codec';
import type {AllParseMediaFields, Options, ParseMediaFields} from './options';
import type {Structure} from './parse-result';
import type {ParserState} from './state/parser-state';

export const getAvailableInfo = (
	options: Options<ParseMediaFields>,
	structure: Structure | null,
	state: ParserState,
): Record<keyof Options<ParseMediaFields>, boolean> => {
	const keys = Object.entries(options).filter(([, value]) => value) as [
		keyof Options<ParseMediaFields>,
		boolean,
	][];

	const infos = keys.map(([_key]) => {
		const key = _key as keyof Options<AllParseMediaFields>;
		if (key === 'structure') {
			return false;
		}

		if (key === 'durationInSeconds') {
			return Boolean(structure && hasDuration(structure, state));
		}

		if (
			key === 'dimensions' ||
			key === 'rotation' ||
			key === 'unrotatedDimensions'
		) {
			return Boolean(structure && hasDimensions(structure, state));
		}

		if (key === 'fps') {
			return Boolean(structure && hasFps(structure));
		}

		if (key === 'isHdr') {
			return Boolean(structure && hasHdr(structure, state));
		}

		if (key === 'videoCodec') {
			return Boolean(structure && hasVideoCodec(structure, state));
		}

		if (key === 'audioCodec') {
			return Boolean(structure && hasAudioCodec(structure, state));
		}

		if (key === 'tracks') {
			return Boolean(structure && hasTracks(structure, state));
		}

		if (key === 'internalStats') {
			return true;
		}

		if (key === 'size') {
			return true;
		}

		if (key === 'name') {
			return true;
		}

		if (key === 'container') {
			return Boolean(structure && hasContainer(structure));
		}

		if (key === 'metadata' || key === 'location') {
			return false;
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

export const hasAllInfo = ({
	fields,
	state,
	structure,
}: {
	structure: Structure | null;
	fields: Options<ParseMediaFields>;
	state: ParserState;
}) => {
	const availableInfo = getAvailableInfo(fields ?? {}, structure, state);
	return (
		Object.values(availableInfo).every(Boolean) &&
		(state.maySkipVideoData() || state.canSkipTracksState.canSkipTracks())
	);
};

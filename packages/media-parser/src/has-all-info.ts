import {m3uHasStreams} from './containers/m3u/get-streams';
import {hasAudioCodec} from './get-audio-codec';
import {hasContainer} from './get-container';
import {hasDimensions} from './get-dimensions';
import {hasDuration, hasSlowDuration} from './get-duration';
import {hasFps, hasFpsSuitedForSlowFps} from './get-fps';
import {hasHdr} from './get-is-hdr';
import {hasKeyframes} from './get-keyframes';
import {hasNumberOfAudioChannels} from './get-number-of-audio-channels';
import {hasSampleRate} from './get-sample-rate';
import {getHasTracks} from './get-tracks';
import {hasVideoCodec} from './get-video-codec';
import {hasMetadata} from './metadata/get-metadata';
import type {AllParseMediaFields, Options, ParseMediaFields} from './options';
import {maySkipVideoData} from './state/may-skip-video-data';
import type {ParserState} from './state/parser-state';

export const getAvailableInfo = ({
	fieldsToFetch,
	state,
}: {
	fieldsToFetch: Options<ParseMediaFields>;
	state: ParserState;
}): Record<keyof Options<ParseMediaFields>, boolean> => {
	const keys = Object.entries(fieldsToFetch).filter(([, value]) => value) as [
		keyof Options<ParseMediaFields>,
		boolean,
	][];

	const structure = state.getStructureOrNull();

	const infos = keys.map(([_key]) => {
		const key = _key as keyof Options<AllParseMediaFields>;
		if (key === 'structure') {
			return false;
		}

		if (key === 'durationInSeconds') {
			return Boolean(structure && hasDuration(state));
		}

		if (key === 'slowDurationInSeconds') {
			return Boolean(structure && hasSlowDuration(state));
		}

		if (
			key === 'dimensions' ||
			key === 'rotation' ||
			key === 'unrotatedDimensions'
		) {
			return Boolean(structure && hasDimensions(state));
		}

		if (key === 'fps') {
			return Boolean(structure && hasFps(state));
		}

		if (key === 'slowFps') {
			// In case FPS is available an non-null, it also works for `slowFps`
			return Boolean(structure && hasFpsSuitedForSlowFps(state));
		}

		if (key === 'isHdr') {
			return Boolean(structure && hasHdr(state));
		}

		if (key === 'videoCodec') {
			return Boolean(structure && hasVideoCodec(state));
		}

		if (key === 'audioCodec') {
			return Boolean(structure && hasAudioCodec(state));
		}

		if (key === 'tracks') {
			return Boolean(structure && getHasTracks(state));
		}

		if (key === 'keyframes') {
			return Boolean(structure && hasKeyframes(state));
		}

		if (key === 'internalStats') {
			return true;
		}

		if (key === 'size') {
			return true;
		}

		if (key === 'mimeType') {
			return true;
		}

		if (key === 'name') {
			return true;
		}

		if (key === 'container') {
			return Boolean(structure && hasContainer(structure));
		}

		if (key === 'metadata' || key === 'location' || key === 'images') {
			return Boolean(structure && hasMetadata(structure));
		}

		if (
			key === 'slowKeyframes' ||
			key === 'slowVideoBitrate' ||
			key === 'slowAudioBitrate' ||
			key === 'slowNumberOfFrames'
		) {
			return false;
		}

		if (key === 'numberOfAudioChannels') {
			return hasNumberOfAudioChannels(state);
		}

		if (key === 'sampleRate') {
			return hasSampleRate(state);
		}

		if (key === 'm3uStreams') {
			return m3uHasStreams(state);
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
}: {
	fields: Options<ParseMediaFields>;
	state: ParserState;
}) => {
	const availableInfo = getAvailableInfo({
		fieldsToFetch: fields ?? {},
		state,
	});

	if (!Object.values(availableInfo).every(Boolean)) {
		return false;
	}

	if (maySkipVideoData({state})) {
		return true;
	}

	if (state.callbacks.canSkipTracksState.canSkipTracks()) {
		return true;
	}

	return false;
};

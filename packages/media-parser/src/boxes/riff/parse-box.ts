/* eslint-disable @typescript-eslint/no-use-before-define */
import type {BufferIterator} from '../../buffer-iterator';
import {getTracks} from '../../get-tracks';
import {hasAllInfo} from '../../has-all-info';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult, RiffStructure} from '../../parse-result';
import {
	registerTrack,
	registerVideoTrackWhenProfileIsAvailable,
} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import type {RiffResult} from './expect-riff-box';
import {expectRiffBox} from './expect-riff-box';
import {
	makeAviAudioTrack,
	makeAviVideoTrack,
	TO_BE_OVERRIDDEN_LATER,
} from './get-tracks-from-avi';
import {getStrfBox, getStrhBox} from './traversal';

const continueAfterRiffBoxResult = ({
	result,
	structure,
	iterator,
	maxOffset,
	state: options,
}: {
	result: RiffResult;
	structure: RiffStructure;
	iterator: BufferIterator;
	maxOffset: number;
	state: ParserState;
}): Promise<ParseResult> => {
	if (result.type === 'incomplete') {
		return Promise.resolve({
			status: 'incomplete',
			async continueParsing() {
				return Promise.resolve(
					continueAfterRiffBoxResult({
						result: await result.continueParsing(),
						structure,
						iterator,
						maxOffset,
						state: options,
					}),
				);
			},
			segments: structure,
			skipTo: null,
		});
	}

	if (result.type === 'complete' && result.box) {
		structure.boxes.push(result.box);
	}

	return parseRiffBody({iterator, maxOffset, state: options, structure});
};

export const parseRiffBody = async ({
	iterator,
	structure,
	maxOffset,
	state,
}: {
	iterator: BufferIterator;
	structure: RiffStructure;
	maxOffset: number;
	state: ParserState;
}): Promise<ParseResult> => {
	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() < maxOffset
	) {
		const result = await expectRiffBox({
			iterator,
			state,
			structure,
		});
		if (result.type === 'complete' && result.skipTo !== null) {
			return {
				status: 'incomplete',
				skipTo: result.skipTo,
				continueParsing() {
					return Promise.resolve(
						continueAfterRiffBoxResult({
							iterator,
							maxOffset,
							state,
							result,
							structure,
						}),
					);
				},
			};
		}

		if (result.type === 'incomplete') {
			return {
				status: 'incomplete',
				async continueParsing() {
					return Promise.resolve(
						continueAfterRiffBoxResult({
							iterator,
							maxOffset,
							state,
							result: await result.continueParsing(),
							structure,
						}),
					);
				},
				skipTo: null,
			};
		}

		if (result.box === null) {
			continue;
		}

		structure.boxes.push(result.box);
		// When parsing an AVI
		if (result.box.type === 'list-box' && result.box.listType === 'hdrl') {
			const tracks = getTracks(structure, state);
			if (!tracks.videoTracks.some((t) => t.codec === TO_BE_OVERRIDDEN_LATER)) {
				state.callbacks.tracks.setIsDone();
			}
		}

		// When parsing a WAV
		if (result.box.type === 'wave-format-box') {
			state.callbacks.tracks.setIsDone();
		}

		if (
			result.box.type === 'strf-box-video' ||
			result.box.type === 'strf-box-audio'
		) {
			const strh = getStrhBox(structure.boxes);
			const strf = getStrfBox(structure.boxes);
			if (!strh || !strf) {
				throw new Error('strh or strf box missing');
			}

			if (strf.type === 'strf-box-audio' && state.onAudioTrack) {
				const audioTrack = makeAviAudioTrack({
					index: state.riff.getNextTrackIndex(),
					strf,
				});
				await registerTrack({
					state,
					track: audioTrack,
					container: 'avi',
				});
			}

			if (state.onVideoTrack && strf.type === 'strf-box-video') {
				const videoTrack = makeAviVideoTrack({
					strh,
					index: state.riff.getNextTrackIndex(),
					strf,
				});
				registerVideoTrackWhenProfileIsAvailable({
					state,
					track: videoTrack,
					container: 'avi',
				});
			}

			state.riff.incrementNextTrackIndex();
		}
	}

	return {
		status: 'done',
	};
};

export const parseRiff = ({
	iterator,
	state,
	fields,
}: {
	iterator: BufferIterator;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	const riff = iterator.getByteString(4, false);
	if (riff !== 'RIFF') {
		throw new Error('Not a RIFF file');
	}

	const structure = state.structure.getStructure();
	if (structure.type !== 'riff') {
		throw new Error('Structure is not a RIFF structure');
	}

	const size = iterator.getUint32Le();
	const fileType = iterator.getByteString(4, false);
	if (fileType !== 'WAVE' && fileType !== 'AVI') {
		throw new Error(`File type ${fileType} not supported`);
	}

	structure.boxes.push({type: 'riff-header', fileSize: size, fileType});

	if (hasAllInfo({fields, state})) {
		return Promise.resolve({
			status: 'done',
			segments: structure,
		});
	}

	return parseRiffBody({
		iterator,
		maxOffset: Infinity,
		state,
		structure,
	});
};

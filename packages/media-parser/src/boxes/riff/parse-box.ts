import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult, RiffStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {expectRiffBox} from './expect-riff-box';
import {makeAviAudioTrack, makeAviVideoTrack} from './get-tracks-from-avi';
import {getStrfBox, getStrhBox} from './traversal';

export const parseRiffBody = ({
	iterator,
	structure,
	maxOffset,
	options,
}: {
	iterator: BufferIterator;
	structure: RiffStructure;
	maxOffset: number;
	options: ParserContext;
}): ParseResult<RiffStructure> => {
	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() < maxOffset
	) {
		const result = expectRiffBox({iterator, boxes: structure.boxes, options});
		if (result.type === 'incomplete') {
			return {
				status: 'incomplete',
				continueParsing() {
					return Promise.resolve(
						parseRiffBody({
							iterator,
							structure,
							maxOffset,
							options,
						}),
					);
				},
				segments: structure,
				skipTo: null,
			};
		}

		structure.boxes.push(result.box);
		if (
			result.box.type === 'strf-box-video' ||
			result.box.type === 'strf-box-audio'
		) {
			const strh = getStrhBox(structure.boxes);
			const strf = getStrfBox(structure.boxes);
			if (!strh || !strf) {
				throw new Error('strh or strf box missing');
			}

			if (strf.type === 'strf-box-audio' && options.onAudioTrack) {
				if (options.onAudioTrack) {
					const audioTrack = makeAviAudioTrack({
						strh,
						index: options.nextTrackIndex,
						strf,
					});
					options.onAudioTrack(audioTrack);
				}
			} else if (options.onVideoTrack && strf.type === 'strf-box-video') {
				const videoTrack = makeAviVideoTrack({
					strh,
					index: options.nextTrackIndex,
					strf,
				});
				options.onVideoTrack(videoTrack);
			}

			options.nextTrackIndex++;
		}
	}

	return {
		status: 'done',
		segments: structure,
	};
};

export const parseRiff = ({
	iterator,
	options,
}: {
	iterator: BufferIterator;
	options: ParserContext;
}): ParseResult<RiffStructure> => {
	const structure: RiffStructure = {type: 'riff', boxes: []};
	const riff = iterator.getByteString(4);
	if (riff !== 'RIFF') {
		throw new Error('Not a RIFF file');
	}

	const size = iterator.getUint32Le();
	const fileType = iterator.getByteString(4);
	if (fileType !== 'WAVE' && fileType !== 'AVI') {
		throw new Error(`File type ${fileType} not supported`);
	}

	structure.boxes.push({type: 'riff-header', fileSize: size, fileType});

	return parseRiffBody({iterator, structure, maxOffset: Infinity, options});
};

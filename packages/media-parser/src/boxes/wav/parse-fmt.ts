import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {WavFmt, WavStructure} from './types';

export const parseFmt = ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	const ckSize = iterator.getUint32Le(); // chunkSize
	const box = iterator.startBox(ckSize);
	const audioFormat = iterator.getUint16Le();
	if (audioFormat !== 1) {
		throw new Error(
			`Only supporting WAVE with PCM audio format, but got ${audioFormat}`,
		);
	}

	const numberOfChannels = iterator.getUint16Le();
	const sampleRate = iterator.getUint32Le();
	const byteRate = iterator.getUint32Le();
	const blockAlign = iterator.getUint16Le();
	const bitsPerSample = iterator.getUint16Le();

	const wavHeader: WavFmt = {
		bitsPerSample,
		blockAlign,
		byteRate,
		numberOfChannels,
		sampleRate,
		type: 'wav-fmt',
	};

	(state.structure.getStructure() as WavStructure).boxes.push(wavHeader);
	state.callbacks.tracks.addTrack({
		type: 'audio',
		// TODO: Is this right
		codec: 'pcm-s16',
		codecPrivate: null,
		description: undefined,
		// TODO: is this right?
		codecWithoutConfig: 'pcm-s32',
		numberOfChannels,
		sampleRate,
		timescale: 1_000_000,
		trackId: 0,
		trakBox: null,
	});

	box.expectNoMoreBytes();

	return Promise.resolve({skipTo: null});
};

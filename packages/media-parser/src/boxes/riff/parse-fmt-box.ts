import type {BufferIterator} from '../../buffer-iterator';
import type {RiffStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {RiffBox, RiffHeader} from './riff-box';

export const parseFmtBox = ({
	iterator,
	size,
	state,
}: {
	iterator: BufferIterator;
	size: number;
	state: ParserState;
}): RiffBox => {
	const box = iterator.startBox(size);
	const structure = state.structure.getStructure() as RiffStructure;

	const riffHeader = structure.boxes.find((b) => b.type === 'riff-header') as
		| RiffHeader
		| undefined;
	if (!riffHeader) {
		throw new Error('Expected RIFF header to be parsed before fmt');
	}

	// TODO: Can we delete this?
	if (riffHeader.fileType !== 'WAVE') {
		throw new Error('Only supporting WAVE type');
	}

	const wFormatTag = iterator.getUint16Le();
	if (wFormatTag !== 1) {
		throw new Error('Expected wFormatTag to be 1, only supporting this');
	}

	const numberOfChannels = iterator.getUint16Le();
	const sampleRate = iterator.getUint32Le();
	const byteRate = iterator.getUint32Le();
	const blockAlign = iterator.getUint16Le();
	const bitsPerSample = iterator.getUint16Le();

	box.expectNoMoreBytes();

	return {
		type: 'wave-format-box',
		formatTag: wFormatTag,
		numberOfChannels,
		sampleRate,
		blockAlign,
		byteRate,
		bitsPerSample,
	};
};

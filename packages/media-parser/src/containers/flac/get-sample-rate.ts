import type {BufferIterator} from '../../buffer-iterator';
import type {ParserState} from '../../state/parser-state';

// https://www.rfc-editor.org/rfc/rfc9639.html#name-sample-rate-bits
export const getSampleRate = (
	iterator: BufferIterator,
	state: ParserState,
): number | 'uncommon-u8' | 'uncommon-u16' | 'uncommon-u16-10' => {
	const mode = iterator.getBits(4);
	if (mode === 0b0000) {
		const structure = state.getFlacStructure();
		const sampleRate =
			structure.boxes.find((box) => box.type === 'flac-streaminfo')
				?.sampleRate ?? null;
		if (sampleRate === null) {
			throw new Error('Sample rate not found');
		}

		return sampleRate;
	}

	if (mode === 0b0001) {
		return 88200;
	}

	if (mode === 0b0010) {
		return 176400;
	}

	if (mode === 0b0011) {
		return 192000;
	}

	if (mode === 0b0100) {
		return 8000;
	}

	if (mode === 0b0101) {
		return 16000;
	}

	if (mode === 0b0110) {
		return 22050;
	}

	if (mode === 0b0111) {
		return 24000;
	}

	if (mode === 0b1000) {
		return 32000;
	}

	if (mode === 0b1001) {
		return 44100;
	}

	if (mode === 0b1010) {
		return 48000;
	}

	if (mode === 0b1011) {
		return 96000;
	}

	if (mode === 0b1100) {
		return 'uncommon-u8';
	}

	if (mode === 0b1101) {
		return 'uncommon-u16';
	}

	if (mode === 0b1110) {
		return 'uncommon-u16-10';
	}

	throw new Error(`Invalid sample rate mode: ${mode.toString(2)}`);
};

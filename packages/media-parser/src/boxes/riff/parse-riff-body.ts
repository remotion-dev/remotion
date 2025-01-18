import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {expectRiffBox} from './expect-riff-box';
import {parseVideoSection} from './parse-video-section';
import type {RiffStructure} from './riff-box';

export const parseRiffBody = async ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	if (state.videoSection.isInVideoSectionState(iterator) === 'in-section') {
		const videoSec = await parseVideoSection({state, iterator});
		return {
			skipTo: videoSec.skipTo,
		};
	}

	const result = await expectRiffBox({
		iterator,
		state,
	});
	if (result.box !== null) {
		const structure = state.structure.getStructure() as RiffStructure;
		structure.boxes.push(result.box);
	}

	return {
		skipTo: result.skipTo,
	};
};

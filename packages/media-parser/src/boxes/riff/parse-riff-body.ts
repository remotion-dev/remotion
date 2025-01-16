import type {BufferIterator} from '../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult, RiffStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {expectRiffBox} from './expect-riff-box';
import {parseRiff} from './parse-riff';
import {parseVideoSection} from './parse-video-section';

export const parseRiffBody = async ({
	iterator,
	state,
	fields,
}: {
	iterator: BufferIterator;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	const continueParsing = () => {
		return parseRiff({
			fields,
			iterator,
			state,
		});
	};

	if (state.videoSection.isInVideoSectionState(iterator) === 'in-section') {
		const videoSec = await parseVideoSection({state, iterator});
		return {
			status: 'incomplete',
			skipTo: videoSec.skipTo,
			continueParsing,
		};
	}

	const result = await expectRiffBox({
		iterator,
		state,
		fields,
	});
	if (result.box !== null) {
		const structure = state.structure.getStructure() as RiffStructure;
		structure.boxes.push(result.box);
	}

	return {
		continueParsing,
		skipTo: result.skipTo,
		status: 'incomplete',
	};
};

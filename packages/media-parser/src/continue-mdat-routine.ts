import {parseIsoBaseMediaBoxes} from './boxes/iso-base-media/parse-boxes';
import {parseMdatPartially} from './boxes/iso-base-media/parse-mdat-partially';
import {getMdatBox} from './boxes/iso-base-media/traversal';
import type {BufferIterator} from './buffer-iterator';
import {hasAllInfo} from './has-all-info';
import type {LogLevel} from './log';
import {maySkipVideoData} from './may-skip-video-data/may-skip-video-data';
import type {Options, ParseMediaFields} from './options';
import type {IsoBaseMediaBox, ParseResult} from './parse-result';
import type {PartialMdatBox} from './parse-video';
import type {ParserState} from './state/parser-state';

export const continueMdatRoutine = async ({
	iterator,
	maxBytes,
	allowIncompleteBoxes,
	initialBoxes,
	state,
	continueMdat,
	signal,
	logLevel,
	fields,
}: {
	iterator: BufferIterator;
	maxBytes: number;
	allowIncompleteBoxes: boolean;
	initialBoxes: IsoBaseMediaBox[];
	state: ParserState;
	continueMdat: PartialMdatBox;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	const initialOffset = iterator.counter.getOffset();

	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() - initialOffset < maxBytes
	) {
		const result = await parseMdatPartially({
			iterator,
			boxSize: continueMdat.boxSize,
			fileOffset: continueMdat.fileOffset,
			parsedBoxes: initialBoxes,
			state,
			signal,
		});

		if (result.type === 'incomplete') {
			throw new Error('Incomplete boxes are not allowed in this routine');
		}

		if (result.type === 'partial-mdat-box') {
			return {
				status: 'incomplete',
				continueParsing: () => {
					return Promise.resolve(
						continueMdatRoutine({
							iterator,
							maxBytes,
							allowIncompleteBoxes,
							initialBoxes,
							state,
							continueMdat: result,
							signal,
							logLevel,
							fields,
						}),
					);
				},
				skipTo: null,
			};
		}

		const alreadyHasMdat = state.structure
			.getStructureOrNull()
			?.boxes.find((b) => b.type === 'mdat-box');

		if (result.box.type === 'mdat-box' && alreadyHasMdat) {
			initialBoxes = initialBoxes.filter((b) => b.type !== 'mdat-box');
			initialBoxes.push(result.box);
			iterator.allowDiscard();

			break;
		} else {
			initialBoxes.push(result.box);
			if (hasAllInfo({fields, state})) {
				return {
					status: 'done',
				};
			}
		}

		iterator.removeBytesRead();
	}

	const mdatState = getMdatBox(initialBoxes);
	const skipped =
		mdatState?.status === 'samples-skipped' &&
		!maySkipVideoData({state}) &&
		state.supportsContentRange;
	const buffered =
		mdatState?.status === 'samples-buffered' && !maySkipVideoData({state});

	if (skipped || buffered) {
		return {
			status: 'incomplete',
			continueParsing: () => {
				if (buffered) {
					iterator.skipTo(mdatState.fileOffset, false);
				}

				return parseIsoBaseMediaBoxes({
					iterator,
					maxBytes,
					allowIncompleteBoxes: false,
					initialBoxes,
					state,
					signal,
					logLevel,
					fields,
				});
			},
			skipTo: skipped ? mdatState.fileOffset : null,
		};
	}

	return {
		status: 'done',
	};
};

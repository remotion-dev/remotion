import type {BufferIterator} from '../../buffer-iterator';
import {continueMdatRoutine} from '../../continue-mdat-routine';
import {hasAllInfo} from '../../has-all-info';
import type {LogLevel} from '../../log';
import {maySkipVideoData} from '../../may-skip-video-data/may-skip-video-data';
import type {Options, ParseMediaFields} from '../../options';
import type {IsoBaseMediaBox, ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {processBox} from './process-box';
import {getMdatBox} from './traversal';

export const parseIsoBaseMediaBoxes = async ({
	iterator,
	maxBytes,
	allowIncompleteBoxes,
	initialBoxes,
	state,
	signal,
	logLevel,
	fields,
}: {
	iterator: BufferIterator;
	maxBytes: number;
	allowIncompleteBoxes: boolean;
	initialBoxes: IsoBaseMediaBox[];
	state: ParserState;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	const initialOffset = iterator.counter.getOffset();

	const continueParsing = () => {
		return parseIsoBaseMediaBoxes({
			iterator,
			maxBytes,
			allowIncompleteBoxes,
			initialBoxes,
			state,
			signal,
			logLevel,
			fields,
		});
	};

	const alreadyHasMdat = state.structure
		.getStructureOrNull()
		?.boxes.find((b) => b.type === 'mdat-box');

	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() - initialOffset < maxBytes
	) {
		const result = await processBox({
			iterator,
			allowIncompleteBoxes,
			parsedBoxes: initialBoxes,
			state,
			signal,
			logLevel,
			fields,
		});

		if (result.type === 'incomplete') {
			if (Number.isFinite(maxBytes)) {
				throw new Error('maxBytes must be Infinity for top-level boxes');
			}

			return {
				status: 'incomplete',
				continueParsing,
				skipTo: null,
			};
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

		if (result.skipTo !== null) {
			if (!state.supportsContentRange) {
				throw new Error(
					'Content-Range header is not supported by the reader, but was asked to seek',
				);
			}

			return {
				status: 'incomplete',
				continueParsing,
				skipTo: result.skipTo,
			};
		}

		if (iterator.bytesRemaining() < 0) {
			return {
				status: 'incomplete',
				continueParsing,
				skipTo: null,
			};
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

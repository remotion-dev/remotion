import type {BufferIterator} from '../../buffer-iterator';
import {hasAllInfo} from '../../has-all-info';
import type {LogLevel} from '../../log';
import {maySkipVideoData} from '../../may-skip-video-data/may-skip-video-data';
import type {Options, ParseMediaFields} from '../../options';
import type {IsoBaseMediaBox, ParseResult} from '../../parse-result';
import type {PartialMdatBox} from '../../parse-video';
import type {ParserState} from '../../state/parser-state';
import {parseMdatPartially} from './parse-mdat-partially';
import {processBox} from './process-box';
import {getMdatBox} from './traversal';

export const parseIsoBaseMediaBoxes = async ({
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
	continueMdat: false | PartialMdatBox;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	const initialOffset = iterator.counter.getOffset();

	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() - initialOffset < maxBytes
	) {
		const result = continueMdat
			? await parseMdatPartially({
					iterator,
					boxSize: continueMdat.boxSize,
					fileOffset: continueMdat.fileOffset,
					parsedBoxes: initialBoxes,
					state,
					signal,
				})
			: await processBox({
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
				continueParsing: () => {
					return parseIsoBaseMediaBoxes({
						iterator,
						maxBytes,
						allowIncompleteBoxes,
						initialBoxes,
						state,
						continueMdat: false,
						signal,
						logLevel,
						fields,
					});
				},
				skipTo: null,
			};
		}

		if (result.type === 'partial-mdat-box') {
			return {
				status: 'incomplete',
				continueParsing: () => {
					return Promise.resolve(
						parseIsoBaseMediaBoxes({
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

		if (result.skipTo !== null) {
			if (!state.supportsContentRange) {
				throw new Error(
					'Content-Range header is not supported by the reader, but was asked to seek',
				);
			}

			return {
				status: 'incomplete',
				continueParsing: () => {
					return parseIsoBaseMediaBoxes({
						iterator,
						maxBytes,
						allowIncompleteBoxes,
						initialBoxes,
						state,
						continueMdat: false,
						signal,
						logLevel,
						fields,
					});
				},
				skipTo: result.skipTo,
			};
		}

		if (iterator.bytesRemaining() < 0) {
			return {
				status: 'incomplete',
				continueParsing: () => {
					return parseIsoBaseMediaBoxes({
						iterator,
						maxBytes,
						allowIncompleteBoxes,
						initialBoxes,
						state,
						continueMdat: false,
						signal,
						logLevel,
						fields,
					});
				},
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
					continueMdat: false,
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

import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	SplitJsxSequenceRequest,
	SplitJsxSequenceResponse,
} from '@remotion/studio-shared';
import {splitJsxSequences} from '../../codemods/split-jsx-sequence';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {broadcastSequenceNodePathMutation} from '../sequence-node-path-mutation';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const splitJsxSequenceHandler: ApiHandler<
	SplitJsxSequenceRequest,
	SplitJsxSequenceResponse
> = ({input: {sequences, splitFrame}, remotionRoot, logLevel}) =>
	withSourceFileWriteQueue(async () => {
		try {
			if (sequences.length === 0) {
				throw new Error('No JSX sequences were specified for splitting');
			}

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[split-jsx-sequence] Received request to split ${sequences.length} sequence${sequences.length === 1 ? '' : 's'} at frame ${splitFrame}`,
			);

			const itemsByFileName = new Map<string, typeof sequences>();
			for (const sequence of sequences) {
				const fileItems = itemsByFileName.get(sequence.fileName) ?? [];
				fileItems.push(sequence);
				itemsByFileName.set(sequence.fileName, fileItems);
			}

			const updates = await Promise.all(
				[...itemsByFileName.entries()].map(async ([fileName, fileItems]) => {
					const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
						remotionRoot,
						fileName,
						action: 'modify',
					});
					const fileContents = readFileSync(absolutePath, 'utf-8');
					const {
						output,
						formatted,
						nodeLabels,
						logLines,
						nodePathRemappings,
						invalidatedNodePathsAfterMutation,
					} = await splitJsxSequences({
						input: fileContents,
						splits: fileItems.map(({nodePath, sequenceKeys}) => ({
							nodePath,
							sequenceKeys,
						})),
						splitFrame,
					});

					return {
						absolutePath,
						fileContents,
						fileRelativeToRoot,
						formatted,
						invalidatedNodePaths: fileItems.map(({nodePath}) => nodePath),
						invalidatedNodePathsAfterMutation,
						logLine: Math.min(...logLines),
						nodeLabels,
						nodePathRemappings,
						output,
					};
				}),
			);
			const nodePathMutation = broadcastSequenceNodePathMutation(
				updates.map(
					({absolutePath, invalidatedNodePaths, nodePathRemappings}) => ({
						absolutePath,
						invalidatedNodePaths,
						remappings: nodePathRemappings,
						restoredNodePaths: [],
					}),
				),
			);

			for (const update of updates) {
				const nodeDescription =
					update.nodeLabels.length === 1
						? update.nodeLabels[0]
						: `${update.nodeLabels.length} clips`;
				pushToUndoStack({
					filePath: update.absolutePath,
					oldContents: update.fileContents,
					newContents: null,
					logLevel,
					remotionRoot,
					logLine: update.logLine,
					description: {
						undoMessage: `↩️  Split of ${nodeDescription}`,
						redoMessage: `↪️  Split of ${nodeDescription}`,
					},
					entryType: 'split-jsx-sequence',
					suppressHmrOnFileRestore: false,
					invalidatedNodePaths: update.invalidatedNodePaths,
					invalidatedNodePathsAfterMutation:
						update.invalidatedNodePathsAfterMutation,
					nodePathRemappings: update.nodePathRemappings,
				});
				suppressUndoStackInvalidation(update.absolutePath);
				writeFileAndNotifyFileWatchers({
					file: update.absolutePath,
					content: update.output,
					originatorClientId: undefined,
					metadata: {skipSequencePropsUpdate: true},
				});

				const locationLabel = formatLogFileLocation({
					remotionRoot,
					absolutePath: update.absolutePath,
					line: update.logLine,
				});
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(
						`${locationLabel}`,
					)} Split ${nodeDescription}`,
				);
				if (!update.formatted) {
					warnAboutPrettierOnce(logLevel);
				}

				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`[split-jsx-sequence] Wrote ${update.fileRelativeToRoot}${
						update.formatted ? ' (formatted)' : ''
					}`,
				);
			}

			printUndoHint(logLevel);

			return {
				success: true,
				nodePathMutation,
			};
		} catch (err) {
			return {
				success: false,
				reason: (err as Error).message,
				stack: (err as Error).stack as string,
			};
		}
	});

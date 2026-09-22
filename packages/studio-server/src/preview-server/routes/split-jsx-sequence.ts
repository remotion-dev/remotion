import {readFileSync} from 'node:fs';
import {splitSequences} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	SplitJsxSequenceRequest,
	SplitJsxSequenceResponse,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {broadcastSequenceNodePathMutation} from '../sequence-node-path-mutation';
import {
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const splitJsxSequenceHandler: ApiHandler<
	SplitJsxSequenceRequest,
	SplitJsxSequenceResponse
> = ({input: {sequences}, remotionRoot, logLevel}) =>
	withSourceFileWriteQueue(async () => {
		try {
			if (sequences.length === 0) {
				throw new Error('No JSX sequences were specified for splitting');
			}

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[split-jsx-sequence] Received request to split ${sequences.length} JSX sequence${sequences.length === 1 ? '' : 's'}`,
			);
			const sequencesByFileName = new Map<string, typeof sequences>();
			for (const sequence of sequences) {
				const fileSequences = sequencesByFileName.get(sequence.fileName) ?? [];
				fileSequences.push(sequence);
				sequencesByFileName.set(sequence.fileName, fileSequences);
			}

			const updates = await Promise.all(
				[...sequencesByFileName].map(async ([fileName, fileSequences]) => {
					const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
						remotionRoot,
						fileName,
						action: 'modify',
					});
					const fileContents = readFileSync(absolutePath, 'utf-8');
					const result = await splitSequences({
						project: {
							files: {[absolutePath]: fileContents},
							rootDir: remotionRoot,
						},
						splits: fileSequences.map(
							({nodePath, sequenceKeys, splitFrame}) => ({
								node: {filePath: absolutePath, nodePath},
								sequenceKeys,
								frame: splitFrame,
							}),
						),
					});
					const output = result.project.files[absolutePath];
					const {nodeLabels, logLines} = result.editDetails[0];
					const nodePathRemappings = result.nodePathRemappings.map(
						({oldNodePath, newNodePath}) => ({oldNodePath, newNodePath}),
					);

					return {
						absolutePath,
						fileContents,
						fileRelativeToRoot,
						logLine: Math.min(...logLines),
						nodeLabels,
						nodePathRemappings,
						output,
					};
				}),
			);
			const nodePathMutation = broadcastSequenceNodePathMutation(
				updates.map((update) => ({
					absolutePath: update.absolutePath,
					remappings: update.nodePathRemappings,
				})),
				null,
			);
			const splitDescription =
				sequences.length === 1
					? updates[0].nodeLabels[0]
					: `${sequences.length} JSX sequences`;

			pushTransactionToUndoStack({
				snapshots: updates.map((update) => ({
					filePath: update.absolutePath,
					oldContents: update.fileContents,
					newContents: null,
					logLine: update.logLine,
					nodePathRemappings: update.nodePathRemappings,
				})),
				logLevel,
				remotionRoot,
				description: {
					undoMessage: `↩️  Split of ${splitDescription}`,
					redoMessage: `↪️  Split of ${splitDescription}`,
				},
				entryType: 'split-jsx-sequence',
				suppressHmrOnFileRestore: false,
				undoRedoNavigation: null,
			});

			for (const update of updates) {
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
				const fileDescription =
					update.nodeLabels.length === 1
						? update.nodeLabels[0]
						: `${update.nodeLabels.length} JSX sequences`;
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(
						`${locationLabel}`,
					)} Split ${fileDescription}`,
				);
				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`[split-jsx-sequence] Wrote ${update.fileRelativeToRoot}`,
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

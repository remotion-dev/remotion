import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	DuplicateJsxNodeRequest,
	DuplicateJsxNodeResponse,
} from '@remotion/studio-shared';
import {duplicateJsxNodes} from '../../codemods/duplicate-jsx-node';
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
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const duplicateJsxNodeHandler: ApiHandler<
	DuplicateJsxNodeRequest,
	DuplicateJsxNodeResponse
> = ({input: {nodes}, remotionRoot, logLevel}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			if (nodes.length === 0) {
				throw new Error('No JSX nodes were specified for duplication');
			}

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[duplicate-jsx-node] Received request to duplicate ${nodes.length} JSX node${nodes.length === 1 ? '' : 's'}`,
			);

			const itemsByFileName = new Map<string, typeof nodes>();
			for (const item of nodes) {
				const fileItems = itemsByFileName.get(item.fileName) ?? [];
				fileItems.push(item);
				itemsByFileName.set(item.fileName, fileItems);
			}

			const updates = await Promise.all(
				[...itemsByFileName.entries()].map(async ([fileName, fileItems]) => {
					const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
						remotionRoot,
						fileName,
						action: 'modify',
					});
					const fileContents = readFileSync(absolutePath, 'utf-8');
					const {output, formatted, nodeLabels, logLines, nodePathRemappings} =
						await duplicateJsxNodes({
							input: fileContents,
							nodePaths: fileItems.map((item) => item.nodePath),
						});

					return {
						absolutePath,
						fileRelativeToRoot,
						fileContents,
						formatted,
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
			);
			const duplicatedNodeDescription =
				nodes.length === 1
					? updates[0].nodeLabels[0]
					: `${nodes.length} JSX nodes`;

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
					undoMessage: `↩️  Duplication of ${duplicatedNodeDescription}`,
					redoMessage: `↪️  Duplication of ${duplicatedNodeDescription}`,
				},
				entryType: 'duplicate-jsx-node',
				suppressHmrOnFileRestore: false,
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
						: `${update.nodeLabels.length} JSX nodes`;
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(`${locationLabel}`)} Duplicated ${fileDescription}`,
				);
				if (!update.formatted) {
					warnAboutPrettierOnce(logLevel);
				}

				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`[duplicate-jsx-node] Wrote ${update.fileRelativeToRoot}${update.formatted ? ' (formatted)' : ''}`,
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
};

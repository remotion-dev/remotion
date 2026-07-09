import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteJsxNodeRequest,
	DeleteJsxNodeResponse,
} from '@remotion/studio-shared';
import {deleteJsxNodes} from '../../codemods/delete-jsx-node';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

const getDeletedNodeDescription = (nodeLabels: string[]): string => {
	if (nodeLabels.length === 1) {
		return nodeLabels[0];
	}

	return `${nodeLabels.length} JSX nodes`;
};

export const deleteJsxNodeHandler: ApiHandler<
	DeleteJsxNodeRequest,
	DeleteJsxNodeResponse
> = ({input: {nodes}, remotionRoot, logLevel}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			if (nodes.length === 0) {
				throw new Error('No JSX nodes were specified for deletion');
			}

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[delete-jsx-node] Received request to delete ${nodes.length} JSX node${nodes.length === 1 ? '' : 's'}`,
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

					const {output, formatted, nodeLabels, logLines} =
						await deleteJsxNodes({
							input: fileContents,
							nodePaths: fileItems.map((item) => item.nodePath),
						});

					return {
						absolutePath,
						fileRelativeToRoot,
						fileContents,
						output,
						formatted,
						nodeLabels,
						logLine: Math.min(...logLines),
					};
				}),
			);

			for (const update of updates) {
				const deletedNodeDescription = getDeletedNodeDescription(
					update.nodeLabels,
				);

				pushToUndoStack({
					filePath: update.absolutePath,
					oldContents: update.fileContents,
					newContents: null,
					logLevel,
					remotionRoot,
					logLine: update.logLine,
					description: {
						undoMessage: `↩️  Deletion of ${deletedNodeDescription}`,
						redoMessage: `↪️  Deletion of ${deletedNodeDescription}`,
					},
					entryType: 'delete-jsx-node',
					suppressHmrOnFileRestore: false,
				});
				suppressUndoStackInvalidation(update.absolutePath);
				writeFileAndNotifyFileWatchers(
					update.absolutePath,
					update.output,
					undefined,
				);

				const locationLabel = formatLogFileLocation({
					remotionRoot,
					absolutePath: update.absolutePath,
					line: update.logLine,
				});
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${RenderInternals.chalk.blueBright(`${locationLabel}`)} Deleted ${deletedNodeDescription}`,
				);
				if (!update.formatted) {
					warnAboutPrettierOnce(logLevel);
				}

				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`[delete-jsx-node] Wrote ${update.fileRelativeToRoot}${update.formatted ? ' (formatted)' : ''}`,
				);
			}

			printUndoHint(logLevel);

			return {
				success: true,
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

import {readFileSync} from 'node:fs';
import {deleteJsxNodes} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteJsxNodesRequest,
	DeleteJsxNodesResponse,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {logHmrTiming} from '../hmr-timing';
import {broadcastSequenceNodePathMutation} from '../sequence-node-path-mutation';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

const getDeletedNodeDescription = (nodeLabels: string[]): string => {
	if (nodeLabels.length === 1) {
		return nodeLabels[0];
	}

	return `${nodeLabels.length} JSX nodes`;
};

export const deleteJsxNodesHandler: ApiHandler<
	DeleteJsxNodesRequest,
	DeleteJsxNodesResponse
> = ({input: {nodes}, remotionRoot, logLevel}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			logHmrTiming({
				detail: null,
				logLevel,
				stage: 'delete-jsx-nodes-request-start',
			});

			if (nodes.length === 0) {
				throw new Error('No JSX nodes were specified for deletion');
			}

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[delete-jsx-nodes] Received request to delete ${nodes.length} JSX node${nodes.length === 1 ? '' : 's'}`,
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

					const result = await deleteJsxNodes({
						project: {
							files: {[absolutePath]: fileContents},
							rootDir: remotionRoot,
						},
						nodes: fileItems.map((item) => ({
							filePath: absolutePath,
							nodePath: item.nodePath,
						})),
					});
					const output = result.project.files[absolutePath];
					const {nodeLabels, logLines} = result.editDetails[0];
					const nodePathRemappings = result.nodePathRemappings.map(
						({oldNodePath, newNodePath}) => ({oldNodePath, newNodePath}),
					);

					return {
						absolutePath,
						fileRelativeToRoot,
						fileContents,
						output,
						nodeLabels,
						nodePathRemappings,
						logLine: Math.min(...logLines),
					};
				}),
			);
			logHmrTiming({
				detail: `files=${updates.length}`,
				logLevel,
				stage: 'delete-jsx-nodes-codemod-complete',
			});
			const nodePathMutation = broadcastSequenceNodePathMutation(
				updates.map((update) => ({
					absolutePath: update.absolutePath,
					remappings: update.nodePathRemappings,
				})),
				null,
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
					entryType: 'delete-jsx-nodes',
					suppressHmrOnFileRestore: false,
					nodePathRemappings: update.nodePathRemappings,
				});
				suppressUndoStackInvalidation(update.absolutePath);
				logHmrTiming({
					detail: `file=${update.fileRelativeToRoot}`,
					logLevel,
					stage: 'source-file-write-start',
				});
				writeFileAndNotifyFileWatchers({
					file: update.absolutePath,
					content: update.output,
					originatorClientId: undefined,
					metadata: {skipSequencePropsUpdate: true},
				});
				logHmrTiming({
					detail: `file=${update.fileRelativeToRoot}`,
					logLevel,
					stage: 'source-file-write-complete',
				});

				const locationLabel = formatLogFileLocation({
					remotionRoot,
					absolutePath: update.absolutePath,
					line: update.logLine,
				});
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(`${locationLabel}`)} Deleted ${deletedNodeDescription}`,
				);
				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`[delete-jsx-nodes] Wrote ${update.fileRelativeToRoot}`,
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

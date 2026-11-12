import {readFileSync} from 'node:fs';
import {CodemodsInternals, reorderNodes} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	ReorderSequenceRequest,
	ReorderSequenceResponse,
} from '@remotion/studio-shared';
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
import {attrName} from './log-updates/formatting';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const reorderSequenceHandler: ApiHandler<
	ReorderSequenceRequest,
	ReorderSequenceResponse
> = ({input, remotionRoot, logLevel}) => {
	const {fileName, sourceNodePaths, targetNodePath, position, clientId} = input;
	return withSourceFileWriteQueue(async () => {
		try {
			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[reorder-sequence] Received request for fileName="${fileName}" position=${position}`,
			);

			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});

			const fileContents = readFileSync(absolutePath, 'utf-8');
			const project = {
				files: {[absolutePath]: fileContents},
				rootDir: remotionRoot,
			};
			const move =
				input.position === 'inside'
					? CodemodsInternals.moveNodesIntoTrack({
							input: fileContents,
							sourceNodePaths: sourceNodePaths.map((node) => node.nodePath),
							targetNodePath: targetNodePath.nodePath,
							timings: input.timings,
						})
					: null;
			const result = move
				? {
						changes: [{nextContents: move.output}],
						editDetails: [move],
						nodePathRemappings: move.nodePathRemappings,
					}
				: await reorderNodes({
						project,
						nodes: sourceNodePaths.map((sourceNodePath) => ({
							filePath: absolutePath,
							nodePath: sourceNodePath.nodePath,
						})),
						target: {filePath: absolutePath, nodePath: targetNodePath.nodePath},
						position: input.position as 'before' | 'after',
					});
			const output = result.changes[0]?.nextContents ?? fileContents;
			const {sequenceLabel, logLine} = result.editDetails[0];
			const nodePathRemappings = result.nodePathRemappings.map(
				({oldNodePath, newNodePath, oldJsxName, newJsxName}) => ({
					oldNodePath,
					newNodePath,
					oldJsxName,
					newJsxName,
				}),
			);
			const nodePathMutation = broadcastSequenceNodePathMutation(
				[
					{
						absolutePath,
						remappings: nodePathRemappings,
					},
				],
				null,
			);

			pushToUndoStack({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: output,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  Reordering of ${sequenceLabel}`,
					redoMessage: `↪️  Reordering of ${sequenceLabel}`,
				},
				entryType: 'reorder-sequence',
				suppressHmrOnFileRestore: false,
				nodePathRemappings,
			});
			suppressUndoStackInvalidation(absolutePath);
			writeFileAndNotifyFileWatchers({
				file: absolutePath,
				content: output,
				originatorClientId: clientId,
				metadata: {skipSequencePropsUpdate: true},
			});

			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath,
				line: logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(`${locationLabel}`)} Reordered ${attrName(sequenceLabel)}`,
			);
			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[reorder-sequence] Wrote ${fileRelativeToRoot}`,
			);

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

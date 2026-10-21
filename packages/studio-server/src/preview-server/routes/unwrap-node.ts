import {readFileSync} from 'node:fs';
import {canUnwrapNode, unwrapNode} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	UnwrapNodeRequest,
	UnwrapNodeResponse,
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

export const unwrapNodeHandler: ApiHandler<
	UnwrapNodeRequest,
	UnwrapNodeResponse
> = ({
	input: {fileName, compositionId, nodePath, dryRun},
	remotionRoot,
	logLevel,
}) => {
	return withSourceFileWriteQueue((): Promise<UnwrapNodeResponse> => {
		try {
			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});
			const fileContents = readFileSync(absolutePath, 'utf-8');
			const canUnwrap = canUnwrapNode({input: fileContents, nodePath});
			if (dryRun) {
				return Promise.resolve({
					success: true,
					canUnwrap,
					nodePathMutation: null,
				});
			}

			const result = unwrapNode({
				project: {files: {[absolutePath]: fileContents}, rootDir: remotionRoot},
				node: {filePath: absolutePath, nodePath},
			});
			const change = result.changes.find(
				({filePath}) => filePath === absolutePath,
			);
			if (
				change?.previousContents !== fileContents ||
				change.nextContents === null
			) {
				throw new Error('Could not unwrap JSX node');
			}

			const output = change.nextContents;
			const remappings = result.nodePathRemappings.map(
				({oldNodePath, newNodePath, oldJsxName, newJsxName}) => ({
					oldNodePath,
					newNodePath,
					oldJsxName,
					newJsxName,
				}),
			);
			const {childNodePath} = result;
			const nodePathMutation = broadcastSequenceNodePathMutation(
				[{absolutePath, remappings}],
				childNodePath !== null
					? {compositionId, absolutePath, nodePath: childNodePath}
					: null,
			);
			const line = result.logLine;
			pushTransactionToUndoStack({
				snapshots: [
					{
						filePath: absolutePath,
						oldContents: fileContents,
						newContents: null,
						logLine: line,
						nodePathRemappings: remappings,
					},
				],
				logLevel,
				remotionRoot,
				description: {
					undoMessage: '↩️  Unwrapping JSX',
					redoMessage: '↪️  Unwrapping JSX',
				},
				entryType: 'unwrap-node',
				suppressHmrOnFileRestore: false,
				undoRedoNavigation: null,
			});
			suppressUndoStackInvalidation(absolutePath);
			writeFileAndNotifyFileWatchers({
				file: absolutePath,
				content: output,
				originatorClientId: undefined,
				metadata: {skipSequencePropsUpdate: true},
			});
			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath,
				line,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(locationLabel)} Unwrapped JSX`,
			);
			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[unwrap-node] Wrote ${fileRelativeToRoot}`,
			);
			printUndoHint(logLevel);
			return Promise.resolve({success: true, canUnwrap, nodePathMutation});
		} catch (err) {
			return Promise.resolve({
				success: false,
				reason: (err as Error).message,
				stack: (err as Error).stack ?? '',
			});
		}
	});
};

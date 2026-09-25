import {readFileSync} from 'node:fs';
import {canWrapJsxNode, wrapJsxNode} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	WrapJsxNodeRequest,
	WrapJsxNodeResponse,
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

export const wrapJsxNodeHandler: ApiHandler<
	WrapJsxNodeRequest,
	WrapJsxNodeResponse
> = ({
	input: {fileName, nodePath, wrapper, width, height},
	remotionRoot,
	logLevel,
}) => {
	return withSourceFileWriteQueue((): Promise<WrapJsxNodeResponse> => {
		try {
			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});
			const fileContents = readFileSync(absolutePath, 'utf-8');
			const eligibility = canWrapJsxNode({input: fileContents, nodePath});
			if (wrapper === null) {
				return Promise.resolve({
					success: true,
					...eligibility,
					nodePathMutation: null,
				});
			}

			if (
				!eligibility.canWrap ||
				((wrapper === 'HtmlInCanvas' || wrapper === 'HtmlInCanvasMotionBlur') &&
					!eligibility.canWrapHtmlInCanvas)
			) {
				throw new Error('This JSX element cannot be wrapped');
			}

			const result = wrapJsxNode({
				project: {files: {[absolutePath]: fileContents}, rootDir: remotionRoot},
				node: {filePath: absolutePath, nodePath},
				wrapper,
				width: width ?? 0,
				height: height ?? 0,
			});
			const change = result.changes.find(
				({filePath}) => filePath === absolutePath,
			);
			if (
				change?.previousContents !== fileContents ||
				change.nextContents === null
			) {
				throw new Error('Could not wrap JSX node');
			}

			const output = change.nextContents;
			const remappings = result.nodePathRemappings.map(
				({oldNodePath, newNodePath}) => ({oldNodePath, newNodePath}),
			);
			const nodePathMutation = broadcastSequenceNodePathMutation(
				[{absolutePath, remappings}],
				null,
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
					undoMessage: `↩️  Wrapping in ${wrapper}`,
					redoMessage: `↪️  Wrapping in ${wrapper}`,
				},
				entryType: 'wrap-jsx-node',
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
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(locationLabel)} Wrapped JSX in <${wrapper}>`,
			);
			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[wrap-jsx-node] Wrote ${fileRelativeToRoot}`,
			);
			printUndoHint(logLevel);
			return Promise.resolve({success: true, ...eligibility, nodePathMutation});
		} catch (err) {
			return Promise.resolve({
				success: false,
				reason: (err as Error).message,
				stack: (err as Error).stack ?? '',
			});
		}
	});
};

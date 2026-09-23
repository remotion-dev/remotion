import {readFileSync} from 'node:fs';
import {CodemodsInternals} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	ReplaceVideoSourceRequest,
	ReplaceVideoSourceResponse,
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
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const replaceVideoSourceHandler: ApiHandler<
	ReplaceVideoSourceRequest,
	ReplaceVideoSourceResponse
> = ({input: {fileName, nodePath, src}, remotionRoot, logLevel}) =>
	withSourceFileWriteQueue<ReplaceVideoSourceResponse>(() => {
		try {
			const {absolutePath} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});
			const fileContents = readFileSync(absolutePath, 'utf-8');
			const {output, logLine, nodePathRemappings} =
				CodemodsInternals.replaceVideoSource({
					input: fileContents,
					nodePath,
					src,
				});
			const nodePathMutation = broadcastSequenceNodePathMutation(
				[{absolutePath, remappings: nodePathRemappings}],
				null,
			);

			pushToUndoStack({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: null,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: '↩️  Removed video background',
					redoMessage: '↪️  Removed video background',
				},
				entryType: 'replace-video-source',
				suppressHmrOnFileRestore: false,
				nodePathRemappings,
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
				line: logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(locationLabel)} Replaced video source`,
			);
			printUndoHint(logLevel);
			return Promise.resolve({success: true as const, nodePathMutation});
		} catch (error) {
			return Promise.resolve({
				success: false,
				reason: (error as Error).message,
				stack: (error as Error).stack ?? '',
			} as const);
		}
	});

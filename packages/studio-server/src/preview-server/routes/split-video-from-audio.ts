import {readFileSync} from 'node:fs';
import {detachAudio} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	SplitVideoFromAudioRequest,
	SplitVideoFromAudioResponse,
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
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const splitVideoFromAudioHandler: ApiHandler<
	SplitVideoFromAudioRequest,
	SplitVideoFromAudioResponse
> = ({input: {fileName, nodePath}, remotionRoot, logLevel}) =>
	withSourceFileWriteQueue(async () => {
		try {
			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[split-video-from-audio] Received request for fileName="${fileName}"`,
			);
			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});

			const fileContents = readFileSync(absolutePath, 'utf-8');

			const result = await detachAudio({
				project: {files: {[absolutePath]: fileContents}, rootDir: remotionRoot},
				node: {filePath: absolutePath, nodePath},
			});
			const output = result.project.files[absolutePath];
			const {formatted, nodeLabel, logLine} = result.editDetails[0];
			const nodePathRemappings = result.nodePathRemappings.map(
				({oldNodePath, newNodePath}) => ({oldNodePath, newNodePath}),
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
				newContents: null,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  Split of audio from ${nodeLabel}`,
					redoMessage: `↪️  Split of audio from ${nodeLabel}`,
				},
				entryType: 'split-video-from-audio',
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
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(
					`${locationLabel}`,
				)} Split audio from ${nodeLabel}`,
			);
			if (!formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[split-video-from-audio] Wrote ${fileRelativeToRoot}${
					formatted ? ' (formatted)' : ''
				}`,
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

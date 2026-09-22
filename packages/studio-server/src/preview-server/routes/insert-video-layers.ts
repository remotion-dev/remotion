import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	InsertVideoLayersRequest,
	InsertVideoLayersResponse,
} from '@remotion/studio-shared';
import {insertVideoLayers} from '../../codemods/insert-video-layers';
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

export const insertVideoLayersHandler: ApiHandler<
	InsertVideoLayersRequest,
	InsertVideoLayersResponse
> = ({
	input: {fileName, nodePath, baseSrc, foregroundSrc},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue<InsertVideoLayersResponse>(() => {
		try {
			const {absolutePath} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});
			const fileContents = readFileSync(absolutePath, 'utf-8');
			const {output, logLine, nodePathRemappings} = insertVideoLayers({
				input: fileContents,
				nodePath,
				baseSrc,
				foregroundSrc,
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
					undoMessage: '↩️  Insertion of separated video layers',
					redoMessage: '↪️  Insertion of separated video layers',
				},
				entryType: 'insert-video-layers',
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
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(locationLabel)} Inserted separated video layers`,
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

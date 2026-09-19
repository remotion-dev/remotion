import {lstatSync, readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import {
	basicCaptionsElementSource,
	getBasicCaptionsElementFile,
} from '@remotion/studio-codemods';
import type {
	InsertBasicCaptionsRequest,
	InsertBasicCaptionsResponse,
} from '@remotion/studio-shared';
import {insertBasicCaptions} from '../../codemods/insert-basic-captions';
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

export const insertBasicCaptionsHandler: ApiHandler<
	InsertBasicCaptionsRequest,
	InsertBasicCaptionsResponse
> = ({
	input: {fileName, nodePath, captions, durationInFrames},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue<InsertBasicCaptionsResponse>(() => {
		try {
			const {absolutePath} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});
			const fileContents = readFileSync(absolutePath, 'utf-8');
			const elementFile = getBasicCaptionsElementFile({
				fileName: absolutePath,
				readFileContents: (candidate) => {
					const {absolutePath: elementPath} = resolveFileInsideProject({
						remotionRoot,
						fileName: candidate,
						action: 'create',
					});
					let stat;
					try {
						stat = lstatSync(elementPath);
					} catch (error) {
						if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
							return null;
						}

						throw error;
					}

					if (!stat.isFile()) {
						throw new Error(`Cannot use ${elementPath} for Basic captions`);
					}

					return readFileSync(elementPath, 'utf-8');
				},
			});
			const {output, logLine, nodePathRemappings} = insertBasicCaptions({
				input: fileContents,
				nodePath,
				captions,
				durationInFrames,
				importPath: elementFile.importPath,
			});
			const nodePathMutation = broadcastSequenceNodePathMutation(
				[{absolutePath, remappings: nodePathRemappings}],
				null,
			);

			pushTransactionToUndoStack({
				snapshots: [
					...(elementFile.shouldWrite
						? [
								{
									filePath: elementFile.fileName,
									oldContents: null,
									newContents: basicCaptionsElementSource,
									logLine: 1,
									nodePathRemappings: null,
								},
							]
						: []),
					{
						filePath: absolutePath,
						oldContents: fileContents,
						newContents: output,
						logLine,
						nodePathRemappings,
					},
				],
				logLevel,
				remotionRoot,
				description: {
					undoMessage: '↩️  Insertion of Basic captions',
					redoMessage: '↪️  Insertion of Basic captions',
				},
				entryType: 'insert-basic-captions',
				suppressHmrOnFileRestore: false,
				undoRedoNavigation: null,
			});
			if (elementFile.shouldWrite) {
				suppressUndoStackInvalidation(elementFile.fileName);
				writeFileAndNotifyFileWatchers({
					file: elementFile.fileName,
					content: basicCaptionsElementSource,
					originatorClientId: undefined,
					metadata: null,
				});
			}

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
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(locationLabel)} Inserted Basic captions`,
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

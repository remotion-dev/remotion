import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {renameComposition} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	CompositionEditResponse,
	RenameCompositionRequest,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {getProjectInfo} from '../project-info';
import {
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {checkIfTypeScriptFile} from './can-update-default-props';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const renameCompositionHandler: ApiHandler<
	RenameCompositionRequest,
	CompositionEditResponse
> = ({input: request, logLevel, remotionRoot, entryPoint}) =>
	withSourceFileWriteQueue(async () => {
		try {
			let filePath: string;
			if (request.symbolicatedStack?.originalFileName) {
				filePath = resolveFileInsideProject({
					remotionRoot,
					fileName: request.symbolicatedStack.originalFileName,
					action: 'rename a composition in',
				}).absolutePath;
			} else {
				const {rootFile} = await getProjectInfo(remotionRoot, entryPoint);
				if (rootFile === null) {
					throw new Error('Cannot find the Remotion root file');
				}

				filePath = rootFile;
			}

			checkIfTypeScriptFile(filePath);
			const result = renameComposition({
				project: {
					files: {[filePath]: readFileSync(filePath, 'utf-8')},
					rootDir: path.dirname(filePath),
				},
				compositionFile: filePath,
				compositionId: request.idToRename,
				newId: request.newId,
			});
			for (const change of result.changes) {
				const currentContents = existsSync(change.filePath)
					? readFileSync(change.filePath, 'utf-8')
					: null;
				if (currentContents !== change.previousContents) {
					throw new Error(
						`Source changed before renaming composition: ${change.filePath}`,
					);
				}
			}

			if (result.changes.length > 0) {
				const logLine = request.symbolicatedStack?.originalLineNumber ?? 1;
				pushTransactionToUndoStack({
					snapshots: result.changes.map((change) => ({
						filePath: change.filePath,
						oldContents: change.previousContents,
						newContents: change.nextContents,
						logLine: change.filePath === filePath ? logLine : 1,
						nodePathRemappings: null,
					})),
					logLevel,
					remotionRoot,
					description: {
						undoMessage: `↩️  Rename of composition "${request.idToRename}" to "${request.newId}"`,
						redoMessage: `↪️  Rename of composition "${request.idToRename}" to "${request.newId}"`,
					},
					entryType: 'rename-composition',
					suppressHmrOnFileRestore: false,
					undoRedoNavigation: request.undoRedoNavigation,
				});

				for (const change of result.changes) {
					if (change.nextContents === null) {
						throw new Error(
							'Renaming a composition cannot remove source files',
						);
					}

					suppressUndoStackInvalidation(change.filePath);
					writeFileAndNotifyFileWatchers({
						file: change.filePath,
						content: change.nextContents,
						originatorClientId: undefined,
						metadata: null,
					});
				}

				const locationLabel = formatLogFileLocation({
					remotionRoot,
					absolutePath: filePath,
					line: logLine,
				});
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(locationLabel)} Renamed composition "${request.idToRename}" to "${request.newId}"`,
				);
				printUndoHint(logLevel);
			}

			return {success: true, nodePathMutation: null};
		} catch (error) {
			return {
				success: false,
				reason: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? (error.stack ?? '') : '',
			};
		}
	});

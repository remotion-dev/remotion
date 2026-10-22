import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {moveFolder} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	CompositionEditResponse,
	MoveFolderRequest,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {getProjectInfo} from '../project-info';
import {broadcastSequenceNodePathMutation} from '../sequence-node-path-mutation';
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

export const moveFolderHandler: ApiHandler<
	MoveFolderRequest,
	CompositionEditResponse
> = ({input: request, logLevel, remotionRoot, entryPoint}) =>
	withSourceFileWriteQueue(async () => {
		try {
			let filePath: string;
			if (request.symbolicatedStack?.originalFileName) {
				filePath = resolveFileInsideProject({
					remotionRoot,
					fileName: request.symbolicatedStack.originalFileName,
					action: 'move a folder in',
				}).absolutePath;
			} else {
				const {rootFile} = await getProjectInfo(remotionRoot, entryPoint);
				if (rootFile === null) {
					throw new Error('Cannot find the Remotion root file');
				}

				filePath = rootFile;
			}

			checkIfTypeScriptFile(filePath);
			const destination =
				request.destination.type === 'folder'
					? {
							type: 'folder' as const,
							folder: {
								name: request.destination.folderName,
								parentName: request.destination.parentName,
							},
						}
					: request.destination.type === 'root'
						? request.destination
						: {
								type: request.destination.type,
								target:
									request.destination.target.type === 'composition'
										? request.destination.target
										: {
												type: 'folder' as const,
												name: request.destination.target.folderName,
												parentName: request.destination.target.parentName,
											},
							};
			const result = moveFolder({
				project: {
					files: {[filePath]: readFileSync(filePath, 'utf-8')},
					rootDir: path.dirname(filePath),
				},
				compositionFile: filePath,
				folder: {name: request.folderName, parentName: request.parentName},
				destination,
			});
			for (const change of result.changes) {
				const currentContents = existsSync(change.filePath)
					? readFileSync(change.filePath, 'utf-8')
					: null;
				if (currentContents !== change.previousContents) {
					throw new Error(
						`Source changed before moving folder: ${change.filePath}`,
					);
				}
			}

			const mutationFiles = [
				...new Set(
					result.nodePathRemappings.map((remapping) => remapping.filePath),
				),
			].map((absolutePath) => ({
				absolutePath,
				remappings: result.nodePathRemappings
					.filter((remapping) => remapping.filePath === absolutePath)
					.map(({oldNodePath, newNodePath, oldJsxName, newJsxName}) => ({
						oldNodePath,
						newNodePath,
						oldJsxName,
						newJsxName,
					})),
			}));
			const nodePathMutation =
				mutationFiles.length === 0
					? null
					: broadcastSequenceNodePathMutation(mutationFiles, null);

			if (result.changes.length > 0) {
				const logLine = request.symbolicatedStack?.originalLineNumber ?? 1;
				const folderPath = request.parentName
					? `${request.parentName}/${request.folderName}`
					: request.folderName;
				pushTransactionToUndoStack({
					snapshots: result.changes.map((change) => ({
						filePath: change.filePath,
						oldContents: change.previousContents,
						newContents: change.nextContents,
						logLine: change.filePath === filePath ? logLine : 1,
						nodePathRemappings:
							mutationFiles.find(
								(mutation) => mutation.absolutePath === change.filePath,
							)?.remappings ?? null,
					})),
					logLevel,
					remotionRoot,
					description: {
						undoMessage: `↩️  Move of folder "${folderPath}"`,
						redoMessage: `↪️  Move of folder "${folderPath}"`,
					},
					entryType: 'move-composition-or-folder',
					suppressHmrOnFileRestore: false,
					undoRedoNavigation: request.undoRedoNavigation,
				});

				for (const change of result.changes) {
					if (change.nextContents === null) {
						throw new Error('Moving a folder cannot remove source files');
					}

					suppressUndoStackInvalidation(change.filePath);
					writeFileAndNotifyFileWatchers({
						file: change.filePath,
						content: change.nextContents,
						originatorClientId: undefined,
						metadata: mutationFiles.some(
							(mutation) => mutation.absolutePath === change.filePath,
						)
							? {skipSequencePropsUpdate: true}
							: null,
					});
				}

				const locationLabel = formatLogFileLocation({
					remotionRoot,
					absolutePath: filePath,
					line: logLine,
				});
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(locationLabel)} Moved folder "${folderPath}"`,
				);
				printUndoHint(logLevel);
			}

			return {success: true, nodePathMutation};
		} catch (error) {
			return {
				success: false,
				reason: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? (error.stack ?? '') : '',
			};
		}
	});

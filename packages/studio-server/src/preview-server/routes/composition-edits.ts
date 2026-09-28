import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {
	addFolder,
	deleteComposition,
	duplicateComposition,
	moveComposition,
	moveFolder,
	renameComposition,
	renameFolder,
	unwrapFolder,
	updateCompositionMetadata,
	type CodemodNodeResult,
	type CodemodResult,
	type CompositionDestination as CodemodCompositionDestination,
} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	AddCompositionRequest,
	AddFolderRequest,
	CompositionDestination,
	CompositionEditResponse,
	DeleteCompositionRequest,
	DuplicateCompositionRequest,
	MoveCompositionRequest,
	MoveFolderRequest,
	RenameCompositionRequest,
	RenameFolderRequest,
	SymbolicatedStackFrame,
	UnwrapFolderRequest,
	UpdateCompositionMetadataRequest,
} from '@remotion/studio-shared';
import {addCompositionToFile} from '../../codemods/add-composition-to-file';
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

const resolveCompositionFile = async ({
	entryPoint,
	remotionRoot,
	symbolicatedStack,
}: {
	entryPoint: string;
	remotionRoot: string;
	symbolicatedStack: SymbolicatedStackFrame | null;
}) => {
	if (symbolicatedStack?.originalFileName) {
		return resolveFileInsideProject({
			remotionRoot,
			fileName: symbolicatedStack.originalFileName,
			action: 'apply composition edit to',
		}).absolutePath;
	}

	const filePath = (await getProjectInfo(remotionRoot, entryPoint)).rootFile;
	if (filePath === null) {
		throw new Error('Cannot find the Remotion root file');
	}

	return filePath;
};

const toCodemodDestination = (
	destination: CompositionDestination,
): CodemodCompositionDestination =>
	destination.type === 'folder'
		? {
				type: 'folder',
				folder: {
					name: destination.folderName,
					parentName: destination.parentName,
				},
			}
		: destination.type === 'root'
			? destination
			: {
					type: destination.type,
					target:
						destination.target.type === 'composition'
							? destination.target
							: {
									type: 'folder',
									name: destination.target.folderName,
									parentName: destination.target.parentName,
								},
				};

type EditResult = CodemodResult | CodemodNodeResult;
type UndoEntryType = Parameters<
	typeof pushTransactionToUndoStack
>[0]['entryType'];

const runCompositionEdit = <
	Request extends {
		symbolicatedStack: SymbolicatedStackFrame | null;
		undoRedoNavigation: AddCompositionRequest['undoRedoNavigation'];
	},
>({
	entryType,
	getDescription,
	getLogMessage,
	getResult,
}: {
	entryType: UndoEntryType;
	getDescription: (request: Request) => {
		undoMessage: string;
		redoMessage: string;
	};
	getLogMessage: (request: Request) => string;
	getResult: (options: {
		filePath: string;
		request: Request;
	}) => EditResult | Promise<EditResult>;
}): ApiHandler<Request, CompositionEditResponse> => {
	return ({input: request, logLevel, remotionRoot, entryPoint}) =>
		withSourceFileWriteQueue(async () => {
			try {
				const filePath = await resolveCompositionFile({
					entryPoint,
					remotionRoot,
					symbolicatedStack: request.symbolicatedStack,
				});
				checkIfTypeScriptFile(filePath);
				const result = await getResult({filePath, request});
				for (const change of result.changes) {
					const currentContents = existsSync(change.filePath)
						? readFileSync(change.filePath, 'utf-8')
						: null;
					if (currentContents !== change.previousContents) {
						throw new Error(
							`Source changed before applying codemod: ${change.filePath}`,
						);
					}
				}

				const remappings =
					'nodePathRemappings' in result ? result.nodePathRemappings : [];
				const mutationFiles = [
					...new Set(remappings.map((remapping) => remapping.filePath)),
				].map((absolutePath) => ({
					absolutePath,
					remappings: remappings
						.filter((remapping) => remapping.filePath === absolutePath)
						.map(({oldNodePath, newNodePath}) => ({
							oldNodePath,
							newNodePath,
						})),
				}));
				const nodePathMutation =
					mutationFiles.length === 0
						? null
						: broadcastSequenceNodePathMutation(mutationFiles, null);

				if (result.changes.length > 0) {
					const logLine = request.symbolicatedStack?.originalLineNumber ?? 1;
					pushTransactionToUndoStack({
						snapshots: result.changes.map((change) => {
							const fileRemappings = mutationFiles.find(
								(file) => file.absolutePath === change.filePath,
							)?.remappings;
							return {
								filePath: change.filePath,
								oldContents: change.previousContents,
								newContents: change.nextContents,
								logLine: change.filePath === filePath ? logLine : 1,
								nodePathRemappings: fileRemappings ?? null,
							};
						}),
						logLevel,
						remotionRoot,
						description: getDescription(request),
						entryType,
						suppressHmrOnFileRestore: false,
						undoRedoNavigation: request.undoRedoNavigation,
					});

					for (const change of result.changes) {
						if (change.nextContents === null) {
							throw new Error('Composition edits cannot remove source files');
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

					const editMessage = `${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(
						formatLogFileLocation({
							remotionRoot,
							absolutePath: filePath,
							line: logLine,
						}),
					)} ${getLogMessage(request)}`;
					RenderInternals.Log.info({indent: false, logLevel}, editMessage);
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
};

const getProject = (filePath: string) => ({
	files: {[filePath]: readFileSync(filePath, 'utf-8')},
	rootDir: path.dirname(filePath),
});

export const addCompositionHandler = runCompositionEdit<AddCompositionRequest>({
	entryType: 'new-composition',
	getDescription: ({options}) => ({
		undoMessage: `↩️  Creation of composition "${options.newId}"`,
		redoMessage: `↪️  Creation of composition "${options.newId}"`,
	}),
	getLogMessage: ({options}) => `Created composition "${options.newId}"`,
	getResult: ({filePath, request}) =>
		addCompositionToFile({filePath, options: request.options}),
});

export const duplicateCompositionHandler =
	runCompositionEdit<DuplicateCompositionRequest>({
		entryType: 'duplicate-composition',
		getDescription: ({idToDuplicate, newId}) => ({
			undoMessage: `↩️  Duplication of composition "${idToDuplicate}" to "${newId}"`,
			redoMessage: `↪️  Duplication of composition "${idToDuplicate}" to "${newId}"`,
		}),
		getLogMessage: ({idToDuplicate, newId}) =>
			`Duplicated composition "${idToDuplicate}" to "${newId}"`,
		getResult: ({filePath, request}) =>
			duplicateComposition({
				project: getProject(filePath),
				compositionFile: filePath,
				compositionId: request.idToDuplicate,
				newId: request.newId,
				tag: request.tag,
				metadata: {
					width: request.newWidth ?? undefined,
					height: request.newHeight ?? undefined,
					fps:
						request.tag === 'Still' ? undefined : (request.newFps ?? undefined),
					durationInFrames:
						request.tag === 'Still'
							? undefined
							: (request.newDurationInFrames ?? undefined),
				},
			}),
	});

export const renameCompositionHandler =
	runCompositionEdit<RenameCompositionRequest>({
		entryType: 'rename-composition',
		getDescription: ({idToRename, newId}) => ({
			undoMessage: `↩️  Rename of composition "${idToRename}" to "${newId}"`,
			redoMessage: `↪️  Rename of composition "${idToRename}" to "${newId}"`,
		}),
		getLogMessage: ({idToRename, newId}) =>
			`Renamed composition "${idToRename}" to "${newId}"`,
		getResult: ({filePath, request}) =>
			renameComposition({
				project: getProject(filePath),
				compositionFile: filePath,
				compositionId: request.idToRename,
				newId: request.newId,
			}),
	});

export const updateCompositionMetadataHandler =
	runCompositionEdit<UpdateCompositionMetadataRequest>({
		entryType: 'update-composition-metadata',
		getDescription: ({idToUpdate}) => ({
			undoMessage: `↩️  Update of metadata of composition "${idToUpdate}"`,
			redoMessage: `↪️  Update of metadata of composition "${idToUpdate}"`,
		}),
		getLogMessage: ({idToUpdate}) =>
			`Updated metadata of composition "${idToUpdate}"`,
		getResult: ({filePath, request}) =>
			updateCompositionMetadata({
				project: getProject(filePath),
				compositionFile: filePath,
				compositionId: request.idToUpdate,
				metadata: {
					width: request.newWidth ?? undefined,
					height: request.newHeight ?? undefined,
					fps: request.newFps ?? undefined,
					durationInFrames: request.newDurationInFrames ?? undefined,
				},
			}),
	});

export const deleteCompositionHandler =
	runCompositionEdit<DeleteCompositionRequest>({
		entryType: 'delete-composition',
		getDescription: ({idToDelete}) => ({
			undoMessage: `↩️  Deletion of composition "${idToDelete}"`,
			redoMessage: `↪️  Deletion of composition "${idToDelete}"`,
		}),
		getLogMessage: ({idToDelete}) => `Deleted composition "${idToDelete}"`,
		getResult: ({filePath, request}) =>
			deleteComposition({
				project: getProject(filePath),
				compositionFile: filePath,
				compositionId: request.idToDelete,
			}),
	});

export const moveCompositionHandler =
	runCompositionEdit<MoveCompositionRequest>({
		entryType: 'move-composition-or-folder',
		getDescription: ({compositionId}) => ({
			undoMessage: `↩️  Move of composition "${compositionId}"`,
			redoMessage: `↪️  Move of composition "${compositionId}"`,
		}),
		getLogMessage: ({compositionId}) => `Moved composition "${compositionId}"`,
		getResult: ({filePath, request}) =>
			moveComposition({
				project: getProject(filePath),
				compositionFile: filePath,
				compositionId: request.compositionId,
				destination: toCodemodDestination(request.destination),
			}),
	});

export const addFolderHandler = runCompositionEdit<AddFolderRequest>({
	entryType: 'new-folder',
	getDescription: ({folderName, parentName}) => {
		const folderPath = parentName ? `${parentName}/${folderName}` : folderName;
		return {
			undoMessage: `↩️  Creation of folder "${folderPath}"`,
			redoMessage: `↪️  Creation of folder "${folderPath}"`,
		};
	},
	getLogMessage: ({folderName, parentName}) =>
		`Created folder "${parentName ? `${parentName}/${folderName}` : folderName}"`,
	getResult: ({filePath, request}) =>
		addFolder({
			project: getProject(filePath),
			compositionFile: filePath,
			folder: {name: request.folderName, parentName: request.parentName},
		}),
});

export const renameFolderHandler = runCompositionEdit<RenameFolderRequest>({
	entryType: 'rename-folder',
	getDescription: ({folderName, parentName, newName}) => {
		const oldPath = parentName ? `${parentName}/${folderName}` : folderName;
		const newPath = parentName ? `${parentName}/${newName}` : newName;
		return {
			undoMessage: `↩️  Rename of folder "${oldPath}" to "${newPath}"`,
			redoMessage: `↪️  Rename of folder "${oldPath}" to "${newPath}"`,
		};
	},
	getLogMessage: ({folderName, parentName}) =>
		`Renamed folder "${parentName ? `${parentName}/${folderName}` : folderName}"`,
	getResult: ({filePath, request}) =>
		renameFolder({
			project: getProject(filePath),
			compositionFile: filePath,
			folder: {name: request.folderName, parentName: request.parentName},
			newName: request.newName,
		}),
});

export const unwrapFolderHandler = runCompositionEdit<UnwrapFolderRequest>({
	entryType: 'delete-folder',
	getDescription: ({folderName, parentName}) => {
		const folderPath = parentName ? `${parentName}/${folderName}` : folderName;
		return {
			undoMessage: `↩️  Deletion of folder "${folderPath}"`,
			redoMessage: `↪️  Deletion of folder "${folderPath}"`,
		};
	},
	getLogMessage: ({folderName, parentName}) =>
		`Deleted folder "${parentName ? `${parentName}/${folderName}` : folderName}"`,
	getResult: ({filePath, request}) =>
		unwrapFolder({
			project: getProject(filePath),
			compositionFile: filePath,
			folder: {name: request.folderName, parentName: request.parentName},
		}),
});

export const moveFolderHandler = runCompositionEdit<MoveFolderRequest>({
	entryType: 'move-composition-or-folder',
	getDescription: ({folderName, parentName}) => {
		const folderPath = parentName ? `${parentName}/${folderName}` : folderName;
		return {
			undoMessage: `↩️  Move of folder "${folderPath}"`,
			redoMessage: `↪️  Move of folder "${folderPath}"`,
		};
	},
	getLogMessage: ({folderName, parentName}) =>
		`Moved folder "${parentName ? `${parentName}/${folderName}` : folderName}"`,
	getResult: ({filePath, request}) =>
		moveFolder({
			project: getProject(filePath),
			compositionFile: filePath,
			folder: {name: request.folderName, parentName: request.parentName},
			destination: toCodemodDestination(request.destination),
		}),
});

import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import type {
	CodemodNodeResult,
	CodemodResult,
	CompositionDestination as CodemodCompositionDestination,
} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	CompositionDestination,
	CompositionEditResponse,
	SymbolicatedStackFrame,
	UndoRedoNavigation,
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

export const toCodemodDestination = (
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

export const runCompositionEdit = <
	Request extends {
		symbolicatedStack: SymbolicatedStackFrame | null;
		undoRedoNavigation: UndoRedoNavigation | null;
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

export const getCompositionEditProject = (filePath: string) => ({
	files: {[filePath]: readFileSync(filePath, 'utf-8')},
	rootDir: path.dirname(filePath),
});

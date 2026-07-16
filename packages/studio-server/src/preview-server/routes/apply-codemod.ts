import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	ApplyCodemodRequest,
	ApplyCodemodResponse,
} from '@remotion/studio-shared';
import {
	applyCodemodToFile,
	resolveFilePathFromSymbolicatedStack,
} from '../../codemods/apply-codemod-to-file';
import {formatOutput} from '../../codemods/duplicate-composition';
import {simpleDiff} from '../../codemods/simple-diff';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {getProjectInfo} from '../project-info';
import {
	printUndoHint,
	pushToUndoStack,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {checkIfTypeScriptFile} from './can-update-default-props';
import {withSourceFileWriteQueue} from './source-file-write-queue';

const formatNewCompositionFile = (componentName: string) => {
	return formatOutput(`import React from 'react';

export const ${componentName}: React.FC = () => {
	return null;
};
`);
};

const getFolderPath = (parentName: string | null, folderName: string) => {
	return parentName ? `${parentName}/${folderName}` : folderName;
};

export const getCodemodLogMessage = (
	codemod: ApplyCodemodRequest['codemod'],
) => {
	if (codemod.type === 'new-composition') {
		const destination = codemod.folderName
			? ` in folder "${getFolderPath(codemod.parentName, codemod.folderName)}"`
			: '';
		return `Created composition "${codemod.newId}"${destination}`;
	}

	if (codemod.type === 'duplicate-composition') {
		return `Duplicated composition "${codemod.idToDuplicate}" to "${codemod.newId}"`;
	}

	if (codemod.type === 'rename-composition') {
		return `Renamed composition "${codemod.idToRename}" to "${codemod.newId}"`;
	}

	if (codemod.type === 'delete-composition') {
		return `Deleted composition "${codemod.idToDelete}"`;
	}

	if (codemod.type === 'move-composition-to-folder') {
		const destination = codemod.folderName
			? `into folder "${getFolderPath(codemod.parentName, codemod.folderName)}"`
			: 'to root';
		return `Moved composition "${codemod.idToMove}" ${destination}`;
	}

	if (codemod.type === 'rename-folder') {
		const oldName = getFolderPath(codemod.parentName, codemod.folderName);
		const newName = getFolderPath(codemod.parentName, codemod.newName);
		return `Renamed folder "${oldName}" to "${newName}"`;
	}

	if (codemod.type === 'new-folder') {
		return `Created folder "${getFolderPath(codemod.parentName, codemod.folderName)}"`;
	}

	if (codemod.type === 'delete-folder') {
		return `Deleted folder "${getFolderPath(codemod.parentName, codemod.folderName)}"`;
	}

	if (codemod.changes.length === 1) {
		return `Updated visual control "${codemod.changes[0].id}"`;
	}

	return `Updated visual controls ${codemod.changes
		.map((change) => `"${change.id}"`)
		.join(', ')}`;
};

const getCodemodUndoDescription = (codemod: ApplyCodemodRequest['codemod']) => {
	if (codemod.type === 'delete-composition') {
		return {
			undoMessage: `↩️  Deletion of composition "${codemod.idToDelete}"`,
			redoMessage: `↪️  Deletion of composition "${codemod.idToDelete}"`,
			entryType: codemod.type,
		};
	}

	if (codemod.type === 'rename-composition') {
		const label = `composition "${codemod.idToRename}" to "${codemod.newId}"`;
		return {
			undoMessage: `↩️  Rename of ${label}`,
			redoMessage: `↪️  Rename of ${label}`,
			entryType: codemod.type,
		};
	}

	if (codemod.type === 'duplicate-composition') {
		const label = `composition "${codemod.idToDuplicate}" to "${codemod.newId}"`;
		return {
			undoMessage: `↩️  Duplication of ${label}`,
			redoMessage: `↪️  Duplication of ${label}`,
			entryType: codemod.type,
		};
	}

	if (codemod.type === 'move-composition-to-folder') {
		const destination =
			codemod.folderName === null
				? 'to root'
				: `into folder "${getFolderPath(codemod.parentName, codemod.folderName)}"`;
		const label = `composition "${codemod.idToMove}" ${destination}`;
		return {
			undoMessage: `↩️  Move of ${label}`,
			redoMessage: `↪️  Move of ${label}`,
			entryType: codemod.type,
		};
	}

	if (codemod.type === 'new-composition') {
		return {
			undoMessage: `↩️  Creation of composition "${codemod.newId}"`,
			redoMessage: `↪️  Creation of composition "${codemod.newId}"`,
			entryType: codemod.type,
		};
	}

	if (codemod.type === 'delete-folder') {
		const label = `folder "${getFolderPath(codemod.parentName, codemod.folderName)}"`;
		return {
			undoMessage: `↩️  Deletion of ${label}`,
			redoMessage: `↪️  Deletion of ${label}`,
			entryType: codemod.type,
		};
	}

	if (codemod.type === 'new-folder') {
		const label = `folder "${getFolderPath(codemod.parentName, codemod.folderName)}"`;
		return {
			undoMessage: `↩️  Creation of ${label}`,
			redoMessage: `↪️  Creation of ${label}`,
			entryType: codemod.type,
		};
	}

	if (codemod.type === 'rename-folder') {
		const oldName = getFolderPath(codemod.parentName, codemod.folderName);
		const newName = getFolderPath(codemod.parentName, codemod.newName);
		const label = `folder "${oldName}" to "${newName}"`;
		return {
			undoMessage: `↩️  Rename of ${label}`,
			redoMessage: `↪️  Rename of ${label}`,
			entryType: codemod.type,
		};
	}

	return {
		undoMessage: '↩️  Visual control change',
		redoMessage: '↪️  Visual control change',
		entryType: 'visual-control' as const,
	};
};

export const applyCodemodHandler: ApiHandler<
	ApplyCodemodRequest,
	ApplyCodemodResponse
> = ({
	input: {codemod, dryRun, symbolicatedStack},
	logLevel,
	remotionRoot,
	entryPoint,
}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			const logLine = symbolicatedStack?.originalLineNumber ?? 1;

			const filePath = symbolicatedStack
				? resolveFilePathFromSymbolicatedStack(remotionRoot, symbolicatedStack)
				: (await getProjectInfo(remotionRoot, entryPoint)).rootFile;

			if (!filePath) {
				throw new Error('Cannot find file for composition in project');
			}

			checkIfTypeScriptFile(filePath);

			const newCompositionComponentFilePath =
				codemod.type === 'new-composition'
					? path.join(path.dirname(filePath), `${codemod.componentName}.tsx`)
					: null;

			if (
				codemod.type === 'new-composition' &&
				newCompositionComponentFilePath &&
				existsSync(newCompositionComponentFilePath)
			) {
				throw new Error(
					`Cannot create ${path.relative(
						remotionRoot,
						newCompositionComponentFilePath,
					)} because it already exists`,
				);
			}

			const input = readFileSync(filePath, 'utf-8');
			const formatted = await applyCodemodToFile({
				filePath,
				codeMod: codemod,
			});

			const diff = simpleDiff({
				oldLines: input.split('\n'),
				newLines: formatted.split('\n'),
			});

			if (!dryRun) {
				const {entryType, undoMessage, redoMessage} =
					getCodemodUndoDescription(codemod);
				const snapshots: Parameters<
					typeof pushTransactionToUndoStack
				>[0]['snapshots'] = [
					{
						filePath,
						oldContents: input,
						newContents: null,
						logLine,
					},
				];
				let componentFilePath: string | null = null;
				let componentFileContents: string | null = null;

				if (codemod.type === 'new-composition') {
					componentFilePath = newCompositionComponentFilePath;
					if (componentFilePath === null) {
						throw new Error('Could not determine the new component file path');
					}

					componentFileContents = await formatNewCompositionFile(
						codemod.componentName,
					);
					snapshots.push({
						filePath: componentFilePath,
						oldContents: null,
						newContents: componentFileContents,
						logLine: 1,
					});
					pushTransactionToUndoStack({
						snapshots,
						logLevel,
						remotionRoot,
						description: {
							undoMessage,
							redoMessage,
						},
						entryType,
						suppressHmrOnFileRestore: false,
					});
				} else {
					pushToUndoStack({
						filePath,
						oldContents: input,
						newContents: null,
						logLevel,
						remotionRoot,
						logLine,
						description: {
							undoMessage,
							redoMessage,
						},
						entryType,
						suppressHmrOnFileRestore: false,
					});
				}

				suppressUndoStackInvalidation(filePath);
				if (componentFilePath) {
					suppressUndoStackInvalidation(componentFilePath);
				}

				writeFileAndNotifyFileWatchers(filePath, formatted, undefined);
				if (componentFilePath && componentFileContents !== null) {
					writeFileAndNotifyFileWatchers(
						componentFilePath,
						componentFileContents,
						undefined,
					);
				}

				const logMessage = getCodemodLogMessage(codemod);
				const editMessage = `${RenderInternals.chalk.blueBright(
					formatLogFileLocation({
						remotionRoot,
						absolutePath: filePath,
						line: logLine,
					}),
				)} ${logMessage}`;
				RenderInternals.Log.info({indent: false, logLevel}, editMessage);
				printUndoHint(logLevel);
			}

			return {
				success: true,
				diff,
			};
		} catch (err) {
			return {
				success: false,
				reason: (err as Error).message,
				stack: (err as Error).stack as string,
			};
		}
	});
};

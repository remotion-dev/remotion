import {readFileSync} from 'node:fs';
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
import {simpleDiff} from '../../codemods/simple-diff';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {getProjectInfo} from '../project-info';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {checkIfTypeScriptFile} from './can-update-default-props';

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

	return {
		undoMessage: '↩️  Visual control change',
		redoMessage: '↪️  Visual control change',
		entryType: 'visual-control' as const,
	};
};

export const applyCodemodHandler: ApiHandler<
	ApplyCodemodRequest,
	ApplyCodemodResponse
> = async ({
	input: {codemod, dryRun, symbolicatedStack},
	logLevel,
	remotionRoot,
	entryPoint,
}) => {
	try {
		const time = Date.now();

		const filePath = symbolicatedStack
			? resolveFilePathFromSymbolicatedStack(remotionRoot, symbolicatedStack)
			: (await getProjectInfo(remotionRoot, entryPoint)).rootFile;

		if (!filePath) {
			throw new Error('Cannot find file for composition in project');
		}

		checkIfTypeScriptFile(filePath);

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
			pushToUndoStack({
				filePath,
				oldContents: input,
				logLevel,
				remotionRoot,
				logLine: symbolicatedStack?.originalLineNumber ?? 1,
				description: {
					undoMessage,
					redoMessage,
				},
				entryType,
				suppressHmrOnFileRestore: false,
			});
			suppressUndoStackInvalidation(filePath);
			writeFileAndNotifyFileWatchers(filePath, formatted, undefined);
			const end = Date.now() - time;
			const relativePath = path.relative(remotionRoot, filePath);
			RenderInternals.Log.info(
				{indent: false, logLevel},
				RenderInternals.chalk.blue(`Edited ${relativePath} in ${end}ms`),
			);
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
};

import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {
	addCanvasCaptureComposition,
	updateVisualControls,
	type CodemodResult,
	addComposition,
	addFolder,
	deleteComposition,
	duplicateComposition,
	moveComposition,
	moveFolder,
	renameComposition,
	renameFolder,
	unwrapFolder,
	updateCompositionMetadata,
	type CompositionDestination,
} from '@remotion/codemods';
import type {
	RecastCodemod,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {emptyCompositionComponent} from '@remotion/studio-shared';
import {resolveFileInsideProject} from '../helpers/resolve-file-inside-project';
import {checkIfTypeScriptFile} from '../preview-server/routes/can-update-default-props';

export const resolveFilePathFromSymbolicatedStack = (
	remotionRoot: string,
	stack: SymbolicatedStackFrame,
): string => {
	if (!stack.originalFileName) {
		throw new Error(
			'Could not determine the file where this composition is defined',
		);
	}

	const {absolutePath} = resolveFileInsideProject({
		remotionRoot,
		fileName: stack.originalFileName,
		action: 'apply codemod to',
	});

	if (!existsSync(absolutePath)) {
		throw new Error(`File not found: ${stack.originalFileName}`);
	}

	return absolutePath;
};

export const applyCodemodToFile = async ({
	filePath,
	codeMod,
}: {
	filePath: string;
	codeMod: RecastCodemod;
}): Promise<CodemodResult> => {
	checkIfTypeScriptFile(filePath);

	const input = await readFile(filePath, 'utf-8');
	const options = {
		project: {files: {[filePath]: input}, rootDir: path.dirname(filePath)},
		compositionFile: filePath,
	};
	if (codeMod.type === 'apply-visual-control') {
		return updateVisualControls({
			...options,
			filePath,
			changes: codeMod.changes,
		});
	}

	if (codeMod.type === 'new-composition') {
		const componentFilePath = path.join(
			path.dirname(filePath),
			`${codeMod.componentName}.tsx`,
		);
		if (existsSync(componentFilePath)) {
			throw new Error(
				`Cannot create ${componentFilePath} because it already exists`,
			);
		}

		const composition = {
			...options,
			compositionId: codeMod.newId,
			component: {
				filePath: componentFilePath,
				importName: codeMod.componentName,
				importPath: codeMod.componentImportPath,
			},
			metadata: {
				width: codeMod.newWidth,
				height: codeMod.newHeight,
				fps: codeMod.newFps,
				durationInFrames: codeMod.newDurationInFrames,
			},
			folder:
				codeMod.folderName === null
					? undefined
					: {name: codeMod.folderName, parentName: codeMod.parentName},
		};
		if (codeMod.canvasCapture !== null) {
			return addCanvasCaptureComposition({
				...composition,
				capture: codeMod.canvasCapture,
			});
		}

		const result = addComposition(composition);
		return {
			...result,
			changes: [
				...result.changes,
				{
					filePath: componentFilePath,
					previousContents: null,
					nextContents: emptyCompositionComponent(codeMod.componentName),
				},
			],
		};
	}

	if (codeMod.type === 'rename-composition') {
		return renameComposition({
			...options,
			compositionId: codeMod.idToRename,
			newId: codeMod.newId,
		});
	}

	if (codeMod.type === 'delete-composition') {
		return deleteComposition({...options, compositionId: codeMod.idToDelete});
	}

	if (
		codeMod.type === 'duplicate-composition' ||
		codeMod.type === 'update-composition-metadata'
	) {
		const metadata = {
			width: codeMod.newWidth ?? undefined,
			height: codeMod.newHeight ?? undefined,
			fps:
				codeMod.type === 'duplicate-composition' && codeMod.tag === 'Still'
					? undefined
					: (codeMod.newFps ?? undefined),
			durationInFrames:
				codeMod.type === 'duplicate-composition' && codeMod.tag === 'Still'
					? undefined
					: (codeMod.newDurationInFrames ?? undefined),
		};
		const result =
			codeMod.type === 'duplicate-composition'
				? duplicateComposition({
						...options,
						compositionId: codeMod.idToDuplicate,
						newId: codeMod.newId,
						tag: codeMod.tag,
						metadata,
					})
				: updateCompositionMetadata({
						...options,
						compositionId: codeMod.idToUpdate,
						metadata,
					});
		return result;
	}

	if (codeMod.type === 'move-composition-or-folder') {
		const target = codeMod.destination;
		const destination: CompositionDestination =
			target.type === 'root'
				? target
				: target.type === 'folder'
					? {
							type: 'folder',
							folder: {name: target.folderName, parentName: target.parentName},
						}
					: {
							type: target.type,
							target:
								target.target.type === 'composition'
									? target.target
									: {
											type: 'folder',
											name: target.target.folderName,
											parentName: target.target.parentName,
										},
						};
		const result =
			codeMod.source.type === 'composition'
				? moveComposition({
						...options,
						compositionId: codeMod.source.compositionId,
						destination,
					})
				: moveFolder({
						...options,
						folder: {
							name: codeMod.source.folderName,
							parentName: codeMod.source.parentName,
						},
						destination,
					});
		return result;
	}

	const folder = {name: codeMod.folderName, parentName: codeMod.parentName};
	const folderResult =
		codeMod.type === 'new-folder'
			? addFolder({...options, folder})
			: codeMod.type === 'rename-folder'
				? renameFolder({...options, folder, newName: codeMod.newName})
				: unwrapFolder({...options, folder});
	return folderResult;
};

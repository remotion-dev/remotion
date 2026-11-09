import {createReadStream, createWriteStream, existsSync, rmSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pipeline} from 'node:stream/promises';
import {
	addCanvasCaptureComposition,
	addOpenTimelineComposition,
	addComposition,
	type CodemodResult,
} from '@remotion/codemods';
import type {NewCompositionOptions} from '@remotion/studio-shared';
import {
	assetCompositionComponent,
	emptyCompositionComponent,
} from '@remotion/studio-shared';
import {openFileForWritingWithoutSymlinks} from '../helpers/open-file-for-writing-without-symlinks';
import {checkIfTypeScriptFile} from '../preview-server/routes/can-update-default-props';
import {prepareOpenTimelineImport} from './prepare-open-timeline-import';

export const addCompositionToFile = async ({
	filePath,
	options,
	remotionRoot,
	publicDir,
	binariesDirectory,
}: {
	filePath: string;
	options: NewCompositionOptions;
	remotionRoot: string;
	publicDir: string;
	binariesDirectory: string | null;
}): Promise<CodemodResult & {copiedAssetPaths: string[]}> => {
	checkIfTypeScriptFile(filePath);
	const input = await readFile(filePath, 'utf-8');
	const componentFilePath = path.join(
		path.dirname(filePath),
		`${options.componentName}.tsx`,
	);
	if (existsSync(componentFilePath)) {
		throw new Error(
			`Cannot create ${path.relative(remotionRoot, componentFilePath)} because it already exists`,
		);
	}

	const composition = {
		project: {files: {[filePath]: input}, rootDir: path.dirname(filePath)},
		compositionFile: filePath,
		compositionId: options.newId,
		component: {
			filePath: componentFilePath,
			importName: options.componentName,
			importPath: options.componentImportPath,
		},
		metadata: {
			width: options.newWidth,
			height: options.newHeight,
			fps: options.newFps,
			durationInFrames: options.newDurationInFrames,
		},
		folder:
			options.folderName === null
				? undefined
				: {name: options.folderName, parentName: options.parentName},
	};
	if (options.openTimeline) {
		const prepared = await prepareOpenTimelineImport({
			request: {
				contents: options.openTimeline.contents,
				mediaDirectory: options.openTimeline.mediaDirectory,
				componentName: options.componentName,
				fps: options.newFps,
				width: options.newWidth,
				height: options.newHeight,
			},
			publicDir,
			remotionRoot,
			binariesDirectory,
		});
		const imported = addOpenTimelineComposition({
			...composition,
			timeline: prepared.timeline,
			fps: options.newFps,
			width: options.newWidth,
			height: options.newHeight,
			resolveMedia: prepared.resolveMedia,
		});
		const copiedAssetPaths: string[] = [];
		try {
			for (const copy of prepared.copies) {
				const fd = openFileForWritingWithoutSymlinks({
					rootDirectory: publicDir,
					absolutePath: copy.destination,
					exclusive: true,
				});
				copiedAssetPaths.push(copy.destination);
				await pipeline(
					createReadStream(copy.source),
					createWriteStream(copy.destination, {fd, autoClose: true}),
				);
			}
		} catch (err) {
			for (const copied of copiedAssetPaths) rmSync(copied, {force: true});
			throw err;
		}

		return {...imported, copiedAssetPaths};
	}

	if (options.canvasCapture !== null) {
		return {
			...addCanvasCaptureComposition({
				...composition,
				capture: options.canvasCapture,
			}),
			copiedAssetPaths: [],
		};
	}

	const result = addComposition(composition);
	return {
		...result,
		copiedAssetPaths: [],
		changes: [
			...result.changes,
			{
				filePath: componentFilePath,
				previousContents: null,
				nextContents:
					options.asset === null
						? emptyCompositionComponent(options.componentName)
						: assetCompositionComponent({
								asset: options.asset,
								componentName: options.componentName,
							}),
			},
		],
	};
};

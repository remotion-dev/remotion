import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {
	addCanvasCaptureComposition,
	addComposition,
	type CodemodResult,
} from '@remotion/codemods';
import type {NewCompositionOptions} from '@remotion/studio-shared';
import {
	assetCompositionComponent,
	emptyCompositionComponent,
} from '@remotion/studio-shared';
import {checkIfTypeScriptFile} from '../preview-server/routes/can-update-default-props';

export const addCompositionToFile = async ({
	filePath,
	options,
}: {
	filePath: string;
	options: NewCompositionOptions;
}): Promise<CodemodResult> => {
	checkIfTypeScriptFile(filePath);
	const input = await readFile(filePath, 'utf-8');
	const componentFilePath = path.join(
		path.dirname(filePath),
		`${options.componentName}.tsx`,
	);
	if (existsSync(componentFilePath)) {
		throw new Error(
			`Cannot create ${componentFilePath} because it already exists`,
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
	if (options.canvasCapture !== null) {
		return addCanvasCaptureComposition({
			...composition,
			capture: options.canvasCapture,
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

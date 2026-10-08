import type {CanvasCaptureData} from '@remotion/studio-shared';
import {addComposition} from './add-composition';
import type {CodemodProject} from './codemod-project';
import {
	type CompositionTarget,
	type CompositionMetadata,
	type FolderReference,
} from './composition-editing';
import {generateCanvasCaptureComposition} from './generate-canvas-capture-composition';
import {findProjectFile} from './internals';
import type {CodemodInsertionResult} from './node-references';
import {parseAst} from './sequence-props/parse-ast';

export type AddCanvasCaptureCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		component: {filePath: string; importName: string; importPath: string};
		metadata: CompositionMetadata;
		folder?: FolderReference;
		capture: {
			data: CanvasCaptureData;
			keyframeFps: number;
			videoFileName: string;
			videoHeight: number;
			videoWidth: number;
		};
	};

export const addCanvasCaptureComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	component,
	metadata,
	folder,
	capture,
}: AddCanvasCaptureCompositionOptions<Project>): CodemodInsertionResult => {
	let existingComponentFile: string | null = null;
	try {
		existingComponentFile = findProjectFile({
			project,
			filePath: component.filePath,
		});
	} catch {
		// The component is created only when no equivalent project path exists.
	}

	if (existingComponentFile !== null) {
		throw new Error(
			`Cannot create ${existingComponentFile} because it already exists`,
		);
	}

	const result = addComposition({
		project,
		compositionFile,
		compositionId,
		component,
		metadata,
		folder,
	});
	const componentSource = generateCanvasCaptureComposition({
		componentName: component.importName,
		durationInFrames: metadata.durationInFrames,
		fps: metadata.fps,
		...capture,
	});
	parseAst(componentSource);
	return {
		...result,
		changes: [
			...result.changes,
			{
				filePath: component.filePath,
				previousContents: null,
				nextContents: componentSource,
			},
		],
	};
};

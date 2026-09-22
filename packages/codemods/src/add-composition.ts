import type {CodemodProject, CodemodResult} from './codemod-project';
import {
	type CompositionTarget,
	type CompositionMetadata,
	type FolderReference,
	assertNewCompositionId,
	validateMetadata,
	editCompositionProject,
} from './composition-editing';

export type AddCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		component: {importName: string; importPath: string};
		metadata: CompositionMetadata;
		folder?: FolderReference;
	};

export const addComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	component,
	metadata,
	folder,
}: AddCompositionOptions<Project>): CodemodResult<Project> => {
	assertNewCompositionId({project, compositionFile, compositionId});
	validateMetadata(metadata);
	if (!/^[A-Z_$][\w$]*$/.test(component.importName)) {
		throw new Error(
			'component.importName must be a named component export beginning with an uppercase letter, _ or $',
		);
	}

	return editCompositionProject({
		project,
		compositionFile,
		codemod: {
			type: 'new-composition',
			newId: compositionId,
			componentName: component.importName,
			componentImportPath: component.importPath,
			newWidth: metadata.width,
			newHeight: metadata.height,
			newFps: metadata.fps,
			newDurationInFrames: metadata.durationInFrames,
			folderName: folder?.name ?? null,
			parentName: folder?.parentName ?? null,
			canvasCapture: null,
		},
	});
};

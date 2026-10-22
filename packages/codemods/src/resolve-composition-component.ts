import type {CodemodProject} from './codemod-project';
import type {CompositionTarget} from './composition-editing';
import {findProjectFile} from './internals';
import {resolveCompositionComponentInProject} from './resolve-composition-component-location';

export type ResolveCompositionComponentOptions = CompositionTarget & {
	project: CodemodProject;
};

export const resolveCompositionComponent = ({
	project,
	compositionFile,
	compositionId,
}: ResolveCompositionComponentOptions) => {
	const resolved = resolveCompositionComponentInProject({
		project,
		compositionFile,
		compositionId,
	});
	return {
		filePath: findProjectFile({project, filePath: resolved.filePath}),
		exportName: resolved.exportName,
		location: {line: resolved.location.line, column: resolved.location.column},
		canAddContent: resolved.canAddSequence,
	};
};

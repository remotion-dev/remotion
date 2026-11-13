import type {CodemodProject, CodemodSource} from './codemod-project';
import type {CompositionTarget} from './composition-editing';
import {resolveCompositionComponentWithFile} from './insert-jsx-element';
import type {CodemodEnvironment} from './insert-jsx-element';
import {findProjectFile} from './internals';
import {resolveCompositionComponentInProject} from './resolve-composition-component-location';

export type ResolveCompositionComponentOptions = CompositionTarget &
	CodemodSource;

export type ResolvedComposition = {
	filePath: string;
	exportName: string;
	location: {line: number; column: number};
	canAddContent: boolean;
};

type ResolveCompositionComponent = {
	(options: CompositionTarget & {project: CodemodProject}): ResolvedComposition;
	(
		options: CompositionTarget & {environment: CodemodEnvironment},
	): Promise<ResolvedComposition>;
	(
		options: ResolveCompositionComponentOptions,
	): ResolvedComposition | Promise<ResolvedComposition>;
};

export const resolveCompositionComponent = ((
	options: ResolveCompositionComponentOptions,
): ResolvedComposition | Promise<ResolvedComposition> => {
	const {compositionFile, compositionId} = options;
	if (options.environment) {
		return resolveCompositionComponentWithFile({
			compositionFile,
			compositionId,
			environment: options.environment,
		}).then((location) => ({
			filePath: location.fileName,
			exportName: location.exportName,
			location: {line: location.line, column: location.column},
			canAddContent: location.canAddSequence,
		}));
	}

	const {project} = options;
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
}) as ResolveCompositionComponent;

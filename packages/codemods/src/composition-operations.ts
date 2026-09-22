import type {RecastCodemod} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {CodemodValue} from './add-content';
import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {getJsxNodes} from './get-jsx-nodes';
import {findProjectFile} from './internals';
import {getJsxNodeProps, updateJsxNodeProps} from './jsx-props';
import {parseAndApplyCodemod} from './parse-and-apply-codemod';
import {resolveCompositionComponentInProject} from './resolve-composition-component-location';
import {parseAst} from './sequence-props/parse-ast';

export type CompositionTarget = {
	compositionFile: string;
	compositionId: string;
};

export type CompositionMetadata = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
};

export type FolderReference = {
	name: string;
	parentName: string | null;
};

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

const getCompositionNodes = ({
	project,
	compositionFile,
}: {
	project: CodemodProject;
	compositionFile: string;
}) => {
	return getJsxNodes({project, filePath: compositionFile})
		.filter(
			(node) =>
				(node.tagName === 'Composition' || node.tagName === 'Still') &&
				node.componentIdentity === `dev.remotion.remotion.${node.tagName}`,
		)
		.map((node) => {
			const status = getJsxNodeProps({project, node, keys: ['id']}).props.id;
			return {node, id: status.status === 'static' ? status.codeValue : null};
		});
};

const requireComposition = ({
	project,
	compositionFile,
	compositionId,
}: ResolveCompositionComponentOptions) => {
	const matches = getCompositionNodes({project, compositionFile}).filter(
		({id}) => id === compositionId,
	);
	if (matches.length !== 1) {
		throw new Error(
			`Expected one composition with ID "${compositionId}" in "${compositionFile}", found ${matches.length}`,
		);
	}

	return matches[0].node;
};

const assertNewCompositionId = ({
	project,
	compositionFile,
	compositionId,
}: ResolveCompositionComponentOptions) => {
	if (!/^[a-zA-Z0-9-]+$/.test(compositionId)) {
		throw new Error(
			'Composition IDs may only contain letters, numbers, and hyphens',
		);
	}

	if (
		getCompositionNodes({project, compositionFile}).some(
			({id}) => id === compositionId,
		)
	) {
		throw new Error(
			`Composition "${compositionId}" already exists in "${compositionFile}"`,
		);
	}
};

const validateMetadata = (metadata: Partial<CompositionMetadata>) => {
	for (const [key, value] of Object.entries(metadata)) {
		if (value === undefined) {
			continue;
		}

		if (
			!Number.isFinite(value) ||
			value <= 0 ||
			(key !== 'fps' && !Number.isInteger(value))
		) {
			throw new Error(
				`${key} must be ${key === 'fps' ? 'a positive finite number' : 'a positive integer'}`,
			);
		}
	}
};

export const editCompositionProject = <Project extends CodemodProject>({
	project,
	compositionFile,
	codemod,
}: {
	project: Project;
	compositionFile: string;
	codemod: RecastCodemod;
}): CodemodResult<Project> => {
	const filePath = findProjectFile({project, filePath: compositionFile});
	if (codemod.type === 'new-composition' || codemod.type === 'new-folder') {
		const functions = new Set<object>();
		recast.visit(parseAst(project.files[filePath]), {
			visitNode(path) {
				if (
					!recast.types.namedTypes.JSXElement.check(path.node) &&
					!recast.types.namedTypes.JSXFragment.check(path.node)
				) {
					this.traverse(path);
					return false;
				}

				let parent = path.parentPath;
				while (parent) {
					if (recast.types.namedTypes.Function.check(parent.node)) {
						functions.add(parent.node);
						break;
					}

					parent = parent.parentPath;
				}

				this.traverse(path);
				return false;
			},
		});
		if (functions.size > 1) {
			throw new Error(
				'Adding registrations requires a file with a single JSX component',
			);
		}
	}

	const {newContents} = parseAndApplyCodemod({
		input: project.files[filePath],
		codeMod: codemod,
	});
	parseAst(newContents);
	return getCodemodResult({
		project,
		nextProject: {
			...project,
			files: {...project.files, [filePath]: newContents},
		},
	});
};

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

export type RenameCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {project: Project; newId: string};

export const renameComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	newId,
}: RenameCompositionOptions<Project>): CodemodResult<Project> => {
	requireComposition({project, compositionFile, compositionId});
	if (newId === compositionId) {
		return getCodemodResult({project, nextProject: project});
	}

	assertNewCompositionId({project, compositionFile, compositionId: newId});
	return editCompositionProject({
		project,
		compositionFile,
		codemod: {type: 'rename-composition', idToRename: compositionId, newId},
	});
};

export type DuplicateCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		newId: string;
		metadata?: Partial<CompositionMetadata>;
	};

export const duplicateComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	newId,
	metadata = {},
}: DuplicateCompositionOptions<Project>): CodemodResult<Project> => {
	const node = requireComposition({project, compositionFile, compositionId});
	assertNewCompositionId({project, compositionFile, compositionId: newId});
	validateMetadata(metadata);
	if (
		node.tagName === 'Still' &&
		(metadata.fps !== undefined || metadata.durationInFrames !== undefined)
	) {
		throw new Error('Still registrations do not have fps or durationInFrames');
	}

	return editCompositionProject({
		project,
		compositionFile,
		codemod: {
			type: 'duplicate-composition',
			idToDuplicate: compositionId,
			newId,
			tag: node.tagName === 'Still' ? 'Still' : 'Composition',
			newWidth: metadata.width ?? null,
			newHeight: metadata.height ?? null,
			newFps: metadata.fps ?? null,
			newDurationInFrames: metadata.durationInFrames ?? null,
		},
	});
};

export type DeleteCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {project: Project};

export const deleteComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
}: DeleteCompositionOptions<Project>): CodemodResult<Project> => {
	requireComposition({project, compositionFile, compositionId});
	return editCompositionProject({
		project,
		compositionFile,
		codemod: {type: 'delete-composition', idToDelete: compositionId},
	});
};

export type UpdateCompositionMetadataOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		metadata: Partial<CompositionMetadata>;
	};

export const updateCompositionMetadata = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	metadata,
}: UpdateCompositionMetadataOptions<Project>): CodemodResult<Project> => {
	const node = requireComposition({project, compositionFile, compositionId});
	validateMetadata(metadata);
	if (
		node.tagName === 'Still' &&
		(metadata.fps !== undefined || metadata.durationInFrames !== undefined)
	) {
		throw new Error('Still registrations do not have fps or durationInFrames');
	}

	if (Object.values(metadata).every((value) => value === undefined)) {
		return getCodemodResult({project, nextProject: project});
	}

	return editCompositionProject({
		project,
		compositionFile,
		codemod: {
			type: 'update-composition-metadata',
			idToUpdate: compositionId,
			newWidth: metadata.width ?? null,
			newHeight: metadata.height ?? null,
			newFps: metadata.fps ?? null,
			newDurationInFrames: metadata.durationInFrames ?? null,
		},
	});
};

export type SetCompositionDefaultPropsOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		defaultProps: Record<string, CodemodValue>;
	};

export const setCompositionDefaultProps = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	defaultProps,
}: SetCompositionDefaultPropsOptions<Project>) => {
	const node = requireComposition({project, compositionFile, compositionId});
	return updateJsxNodeProps({project, node, props: {defaultProps}});
};

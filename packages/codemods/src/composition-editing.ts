import type {RecastCodemod} from '@remotion/studio-shared';
import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {getJsxNodeProps} from './get-jsx-node-props';
import {getJsxNodes} from './get-jsx-nodes';
import {findProjectFile} from './internals';
import {parseAndApplyCodemod} from './parse-and-apply-codemod';
import type {ResolveCompositionComponentOptions} from './resolve-composition-component';
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

export const requireComposition = ({
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

export const assertNewCompositionId = ({
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

export const validateMetadata = (metadata: Partial<CompositionMetadata>) => {
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

import type {InsertableCompositionElement} from '@remotion/studio-shared';
import type {CodemodProject} from './codemod-project';
import {insertJsxElementIntoProjectWithNodePathRemappings} from './insert-jsx-element';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	type CodemodInsertionResult,
} from './node-references';

export type CodemodValue =
	| string
	| number
	| boolean
	| null
	| CodemodValue[]
	| {[key: string]: CodemodValue};

export type AddContentOptions<Project extends CodemodProject> = {
	project: Project;
	compositionFile: string;
	compositionId: string;
	from?: number;
	durationInFrames?: number;
	position?: {x: number; y: number};
};

export type AddMediaOptions<Project extends CodemodProject> =
	AddContentOptions<Project> & {
		type: 'image' | 'video' | 'audio' | 'gif' | 'animated-image';
		src: string;
		srcType: 'static' | 'remote';
		dimensions?: {width: number; height: number};
	};

export type AddComponentOptions<Project extends CodemodProject> =
	AddContentOptions<Project> & {
		importName: string;
		importPath: string;
		props?: Record<string, CodemodValue>;
	};

const insertContent = async <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	from,
	durationInFrames,
	position,
	element,
}: AddContentOptions<Project> & {
	element: InsertableCompositionElement;
}): Promise<CodemodInsertionResult<Project>> => {
	if (from !== undefined && (!Number.isInteger(from) || from < 0)) {
		throw new Error('from must be a non-negative integer');
	}

	if (
		durationInFrames !== undefined &&
		(!Number.isInteger(durationInFrames) || durationInFrames <= 0)
	) {
		throw new Error('durationInFrames must be a positive integer');
	}

	if (
		position &&
		(!Number.isFinite(position.x) || !Number.isFinite(position.y))
	) {
		throw new Error('Position must be finite');
	}

	const wrapped = from !== undefined || durationInFrames !== undefined;
	const insertion = await insertJsxElementIntoProjectWithNodePathRemappings({
		project,
		request: {
			compositionFile,
			compositionId,
			from: null,
			element: {...element, position: wrapped ? null : (position ?? null)},
		},
		svgMarkupToJsx: () => {
			throw new Error('SVG markup is not supported by this operation');
		},
		wrapInSequence: wrapped
			? {
					dimensions: element.type === 'asset' ? element.dimensions : null,
					durationInFrames: durationInFrames ?? null,
					from: from ?? 0,
					name: null,
					position: position ?? null,
				}
			: null,
	});
	const filePath = findProjectFile({project, filePath: insertion.filePath});
	if (!insertion.insertedNodePath) {
		throw new Error('Could not locate the inserted JSX node');
	}

	return {
		...getNodeEditResult({
			project,
			edits: [
				{
					filePath,
					output: insertion.project.files[insertion.filePath],
					nodePathRemappings: insertion.nodePathRemappings,
				},
			],
		}),
		insertedNode: {filePath, nodePath: insertion.insertedNodePath},
	};
};

export const addMedia = <Project extends CodemodProject>({
	type,
	src,
	srcType,
	dimensions,
	...options
}: AddMediaOptions<Project>): Promise<CodemodInsertionResult<Project>> => {
	if (
		dimensions &&
		(!Number.isFinite(dimensions.width) ||
			dimensions.width <= 0 ||
			!Number.isFinite(dimensions.height) ||
			dimensions.height <= 0)
	) {
		throw new Error('Media dimensions must be positive finite numbers');
	}

	return insertContent({
		...options,
		element: {
			type: 'asset',
			assetType: type,
			src,
			srcType,
			dimensions: dimensions ?? null,
			durationInFrames: null,
			position: null,
		},
	});
};

export const addComponent = <Project extends CodemodProject>({
	importName,
	importPath,
	props = {},
	...options
}: AddComponentOptions<Project>): Promise<CodemodInsertionResult<Project>> => {
	if (!/^[A-Z_$][\w$]*$/.test(importName) || importName === 'default') {
		throw new Error(
			'importName must be a named component export beginning with an uppercase letter, _ or $',
		);
	}

	return insertContent({
		...options,
		element: {
			type: 'component',
			componentName: importName,
			importName,
			importPath,
			props: Object.entries(props).map(([name, value]) => ({name, value})),
			position: null,
		},
	});
};

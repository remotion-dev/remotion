import type {InsertableCompositionElement} from '@remotion/studio-shared';
import type {CodemodProject} from './codemod-project';
import {insertJsxElementIntoProjectWithNodePathRemappings} from './insert-jsx-element';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	type CodemodInsertionResult,
} from './node-references';

export type AddContentOptions<Project extends CodemodProject> = {
	project: Project;
	compositionFile: string;
	compositionId: string;
	from?: number;
	durationInFrames?: number;
	position?: {x: number; y: number};
};

export const insertContent = async <Project extends CodemodProject>({
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

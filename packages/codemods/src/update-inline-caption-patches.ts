import type {CaptionPatch} from '@remotion/studio-shared';
import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
	type NodeReference,
} from './node-references';
import {updateInlineCaptionPatches as updateInlineCaptionPatchesInSource} from './update-inline-caption-patches-in-source';

export type InlineCaptionPatch = CaptionPatch;
export type UpdateInlineCaptionPatchesOptions<Project extends CodemodProject> =
	{
		project: Project;
		node: NodeReference;
		patches: readonly InlineCaptionPatch[];
	};

export const updateInlineCaptionPatches = <Project extends CodemodProject>({
	project,
	node,
	patches,
}: UpdateInlineCaptionPatchesOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const {output, logLine, changedFields} = updateInlineCaptionPatchesInSource({
		input,
		nodePath: node.nodePath,
		patches: [...patches],
	});
	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			},
		],
	});
	return {
		...result,
		updatedNode: getUpdatedNodeReference({project, ...result, node}),
		changedFields,
		editDetails: [{filePath, logLine}],
	};
};

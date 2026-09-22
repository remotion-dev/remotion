import type {EnumPath} from '@remotion/studio-shared';
import type {CodemodProject} from './codemod-project';
import type {CodemodValue} from './codemod-value';
import {
	type CompositionTarget,
	requireComposition,
} from './composition-editing';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
} from './node-references';
import {
	getCompositionDefaultPropsLine,
	updateDefaultProps,
} from './update-default-props';
import {updateJsxNodeProps} from './update-jsx-node-props';

export type SetCompositionDefaultPropsOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		defaultProps: Record<string, CodemodValue>;
		enumPaths?: EnumPath[];
	};

export const setCompositionDefaultProps = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	defaultProps,
	enumPaths,
}: SetCompositionDefaultPropsOptions<Project>) => {
	const node = requireComposition({project, compositionFile, compositionId});
	if (enumPaths === undefined) {
		return updateJsxNodeProps({project, node, props: {defaultProps}});
	}

	const input = project.files[node.filePath];
	const logLine = getCompositionDefaultPropsLine({input, compositionId});
	const {output} = updateDefaultProps({
		input,
		compositionId,
		newDefaultProps: defaultProps,
		enumPaths,
	});
	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath: node.filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			},
		],
	});
	return {
		...result,
		logLine,
		updatedNode: getUpdatedNodeReference({...result, node}),
	};
};

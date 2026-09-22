import type {InteractivitySchema, VideoConfigValues} from 'remotion';
import type {CodemodProject} from './codemod-project';
import type {CodemodValue} from './codemod-value';
import {getJsxNodeProps} from './get-jsx-node-props';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUpdatedNodeReference,
	type JsxNodeReference,
} from './node-references';
import {parseAst} from './sequence-props/parse-ast';
import {updateMultipleSequenceProps} from './update-sequence-props';

export type UpdateJsxNodePropsOptions<Project extends CodemodProject> = {
	project: Project;
	node: JsxNodeReference;
	props: Record<string, CodemodValue | undefined>;
	schema?: InteractivitySchema;
	videoConfig?: VideoConfigValues;
};

export const updateJsxNodeProps = <Project extends CodemodProject>({
	project,
	node,
	props,
	schema = {},
	videoConfig,
}: UpdateJsxNodePropsOptions<Project>) => {
	const keys = Object.keys(props);
	if (keys.length === 0) {
		throw new Error('Expected at least one prop to update');
	}

	const status = getJsxNodeProps({project, node, keys, videoConfig});
	for (const key of keys) {
		if (
			!key ||
			key.split('.').some((part) => !part) ||
			key.split('.').length > 2
		) {
			throw new Error(
				'Prop keys must be names or one-level nested paths such as style.opacity',
			);
		}

		if (status.props[key]?.status === 'computed') {
			throw new Error(`Cannot update computed prop "${key}"`);
		}
	}

	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const edit = updateMultipleSequenceProps({
		input,
		ast,
		changes: [
			{
				nodePath: node.nodePath,
				updates: Object.entries(props).map(([key, value]) => ({
					key,
					value,
					defaultValue: null,
				})),
				schema,
				videoConfigValues: videoConfig ?? null,
			},
		],
	});
	const {nodePathRemappings} = getNodePathRemappings({
		ast: edit.ast,
		captured,
		output: edit.output,
	});
	const result = getNodeEditResult({
		project,
		edits: [{filePath, output: edit.output, nodePathRemappings}],
	});
	return {...result, updatedNode: getUpdatedNodeReference({...result, node})};
};

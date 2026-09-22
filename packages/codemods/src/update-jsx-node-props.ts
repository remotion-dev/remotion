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
	type NodeSourceEdit,
} from './node-references';
import {parseAst} from './sequence-props/parse-ast';
import {
	updateMultipleSequenceProps,
	type SequencePropUpdate,
	type SequencePropsNodeUpdateResult,
} from './update-sequence-props';

type JsxNodePropValues =
	| {props: Record<string, CodemodValue | undefined>; updates?: never}
	| {updates: SequencePropUpdate[]; props?: never};

export type JsxNodePropChange = JsxNodePropValues & {
	node: JsxNodeReference;
	schema?: InteractivitySchema;
	videoConfig?: VideoConfigValues;
};

export type UpdateJsxNodePropsOptions<Project extends CodemodProject> =
	JsxNodePropChange & {
		project: Project;
		prettierConfigOverride?: Record<string, unknown> | null;
	};

export type UpdateMultipleJsxNodePropsOptions<Project extends CodemodProject> =
	{
		project: Project;
		changes: JsxNodePropChange[];
		prettierConfigOverride?: Record<string, unknown> | null;
	};

export const updateMultipleJsxNodeProps = <Project extends CodemodProject>({
	project,
	changes,
	prettierConfigOverride,
}: UpdateMultipleJsxNodePropsOptions<Project>) => {
	if (changes.length === 0) {
		throw new Error('Expected at least one node to update');
	}

	const groups = new Map<
		string,
		{change: JsxNodePropChange; index: number}[]
	>();
	for (const [index, change] of changes.entries()) {
		const filePath = findProjectFile({project, filePath: change.node.filePath});
		const group = groups.get(filePath) ?? [];
		group.push({change, index});
		groups.set(filePath, group);
	}

	const edits: NodeSourceEdit[] = [];
	const results: SequencePropsNodeUpdateResult[] = [];
	for (const [filePath, group] of groups) {
		const input = project.files[filePath];
		const ast = parseAst(input);
		const captured = captureJsxNodePaths(ast);
		const edit = updateMultipleSequenceProps({
			input,
			ast,
			prettierConfigOverride,
			changes: group.map(({change}) => {
				const updates =
					change.updates ??
					Object.entries(change.props).map(([key, value]) => ({
						key,
						value,
						defaultValue: null,
					}));
				if (updates.length === 0) {
					throw new Error('Expected at least one prop to update');
				}

				const keys = updates.map(({key}) => key);
				const status = change.updates
					? null
					: getJsxNodeProps({
							project,
							node: change.node,
							keys,
							videoConfig: change.videoConfig,
						});
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

					if (status?.props[key]?.status === 'computed') {
						throw new Error(`Cannot update computed prop "${key}"`);
					}
				}

				return {
					nodePath: change.node.nodePath,
					updates,
					schema: change.schema ?? {},
					videoConfigValues: change.videoConfig ?? null,
				};
			}),
		});
		const {nodePathRemappings} = getNodePathRemappings({
			ast: edit.ast,
			captured,
			output: edit.output,
		});
		edits.push({filePath, output: edit.output, nodePathRemappings});
		for (const [index, item] of group.entries()) {
			results[item.index] = edit.results[index];
		}
	}

	const result = getNodeEditResult({project, edits});
	return {
		...result,
		results,
		formatted: true,
		updatedNodes: changes.map(({node}) =>
			getUpdatedNodeReference({...result, node}),
		),
	};
};

export const updateJsxNodeProps = <Project extends CodemodProject>({
	project,
	prettierConfigOverride,
	...change
}: UpdateJsxNodePropsOptions<Project>) => {
	const result = updateMultipleJsxNodeProps({
		project,
		changes: [change],
		prettierConfigOverride,
	});
	return {
		...result,
		...result.results[0],
		updatedNode: result.updatedNodes[0],
	};
};

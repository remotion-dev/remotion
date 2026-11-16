import type {CodemodElement} from './codemod-element';
import type {CodemodProject} from './codemod-project';
import {applyCodemodChanges} from './codemod-project';
import type {CodemodValue} from './codemod-value';
import {addEffect as addEffectInSource} from './effect-operations';
import {getEffectSource} from './effect-references';
import {
	getNodeEditResult,
	getInsertedNodeReferences,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
	type NodeReference,
} from './node-references';
import {wrapNode} from './wrap-node';

export type AddEffectOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
	importName: string;
	importPath: string;
	props?: Record<string, CodemodValue>;
};

export const addEffect = <Project extends CodemodProject>({
	project,
	node,
	importName,
	importPath,
	props = {},
}: AddEffectOptions<Project>) => {
	const {filePath, input, length} = getEffectSource({project, node});
	const {output, formatted, effectLabel, nodeLabel, logLine} =
		addEffectInSource({
			input,
			sequenceNodePath: node.nodePath,
			effectName: importName,
			effectImportPath: importPath,
			effectConfig: props,
		});
	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({
					input,
					output,
				}).map((remapping) => ({...remapping, effectsOnly: true as const})),
			},
		],
	});
	return {
		...result,
		editDetails: [{filePath, formatted, effectLabel, nodeLabel, logLine}],
		insertedEffect: {
			...getUpdatedNodeReference({project, ...result, node}),
			effectIndex: length,
		},
	};
};

export const addEffectWithOptionalWrapper = <Project extends CodemodProject>({
	wrapper,
	...options
}: AddEffectOptions<Project> & {wrapper: CodemodElement | null}) => {
	if (wrapper === null) {
		return addEffect(options);
	}

	const wrapped = wrapNode({...options, wrapper});
	const [insertedNode] = getInsertedNodeReferences(wrapped.nodePathRemappings);
	if (!insertedNode) {
		throw new Error('Could not locate the inserted wrapper');
	}

	const added = addEffect({
		...options,
		project: applyCodemodChanges(options.project, wrapped.changes),
		node: insertedNode,
	});
	const effectRemappings = new Map(
		added.nodePathRemappings.map((remapping) => [
			JSON.stringify(remapping.oldNodePath),
			remapping,
		]),
	);
	const wrappedPaths = new Set(
		wrapped.nodePathRemappings.map(({newNodePath}) =>
			JSON.stringify(newNodePath),
		),
	);
	const nodePathRemappings = [
		...wrapped.nodePathRemappings.map((remapping) => {
			const next = effectRemappings.get(JSON.stringify(remapping.newNodePath));
			return next ? {...remapping, newNodePath: next.newNodePath} : remapping;
		}),
		...added.nodePathRemappings
			.filter(({oldNodePath}) => !wrappedPaths.has(JSON.stringify(oldNodePath)))
			.map(({effectsOnly: _effectsOnly, ...remapping}) => remapping),
	];
	const output = added.changes[0]?.nextContents;
	if (output === null || output === undefined) {
		throw new Error('Could not add the effect to the wrapper');
	}

	return {
		...added,
		...getNodeEditResult({
			project: options.project,
			edits: [{filePath: insertedNode.filePath, output, nodePathRemappings}],
		}),
	};
};

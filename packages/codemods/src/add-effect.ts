import {createElement} from './codemod-element';
import {applyCodemodChanges, type CodemodProject} from './codemod-project';
import type {CodemodValue} from './codemod-value';
import {addEffect as addEffectInSource} from './effect-operations';
import {getEffectSource} from './effect-references';
import {
	getNodeEditResult,
	getInsertedNodeReferences,
	getUnchangedStructureRemappings,
	type NodeReference,
	type NodeSourceEdit,
} from './node-references';
import {wrapNode} from './wrap-node';

export type AddEffectOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
	importName: string;
	importPath: string;
	props?: Record<string, CodemodValue>;
	wrapInHtmlInCanvas: {
		from: number;
		durationInFrames: number;
		trimBefore: number;
	} | null;
};

export const addEffect = <Project extends CodemodProject>({
	project,
	node,
	importName,
	importPath,
	props = {},
	wrapInHtmlInCanvas,
}: AddEffectOptions<Project>) => {
	const wrapped =
		wrapInHtmlInCanvas === null
			? null
			: wrapNode({
					project,
					node,
					wrapper: createElement({
						component: 'HtmlInCanvas',
						importPath: 'remotion',
						props: {
							from: wrapInHtmlInCanvas.from,
							durationInFrames: wrapInHtmlInCanvas.durationInFrames,
							trimBefore: wrapInHtmlInCanvas.trimBefore,
						},
					}),
				});
	const target = wrapped
		? getInsertedNodeReferences(wrapped.nodePathRemappings)[0]
		: node;
	if (!target) {
		throw new Error('Could not locate the inserted wrapper');
	}

	const {filePath, input, length} = getEffectSource({
		project: wrapped ? applyCodemodChanges(project, wrapped.changes) : project,
		node: target,
	});
	const {output, formatted, effectLabel, nodeLabel, logLine} =
		addEffectInSource({
			input,
			sequenceNodePath: target.nodePath,
			effectName: importName,
			effectImportPath: importPath,
			effectConfig: props,
		});
	const effectRemappings = getUnchangedStructureRemappings({input, output});
	let nodePathRemappings: NodeSourceEdit['nodePathRemappings'] =
		effectRemappings.map((remapping) => ({
			...remapping,
			effectsOnly: true,
		}));
	if (wrapped) {
		const effectsByOldPath = new Map(
			effectRemappings.map((remapping) => [
				JSON.stringify(remapping.oldNodePath),
				remapping,
			]),
		);
		const wrappedPaths = new Set(
			wrapped.nodePathRemappings.map(({newNodePath}) =>
				JSON.stringify(newNodePath),
			),
		);
		nodePathRemappings = [
			...wrapped.nodePathRemappings.map((remapping) => {
				const next = effectsByOldPath.get(
					JSON.stringify(remapping.newNodePath),
				);
				return next ? {...remapping, newNodePath: next.newNodePath} : remapping;
			}),
			...effectRemappings.filter(
				({oldNodePath}) => !wrappedPaths.has(JSON.stringify(oldNodePath)),
			),
		];
	}

	const effectNodePath = effectRemappings.find(
		({oldNodePath}) =>
			JSON.stringify(oldNodePath) === JSON.stringify(target.nodePath),
	)?.newNodePath;
	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output, nodePathRemappings}],
		}),
		editDetails: [{filePath, formatted, effectLabel, nodeLabel, logLine}],
		insertedEffect: {
			filePath,
			nodePath: effectNodePath ?? target.nodePath,
			effectIndex: length,
		},
	};
};

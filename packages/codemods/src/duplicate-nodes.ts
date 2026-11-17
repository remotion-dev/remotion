import type {CodemodProject} from './codemod-project';
import {duplicateNodes as duplicateNodesInSource} from './duplicate-jsx-node';
import {
	getNodeEditResult,
	getInsertedNodeReferences,
	groupNodeReferencesByFile,
	type CodemodNodeResult,
	type NodeReference,
} from './node-references';

export type DuplicateNodesOptions<Project extends CodemodProject> = {
	project: Project;
	nodes: NodeReference[];
};

export type DuplicateNodesResult = CodemodNodeResult & {
	insertedNodes: NodeReference[];
	duplicatedNodes: NodeReference[];
	editDetails: {filePath: string; nodeLabels: string[]; logLines: number[]}[];
};

export const duplicateNodes = <Project extends CodemodProject>({
	project,
	nodes,
}: DuplicateNodesOptions<Project>): DuplicateNodesResult => {
	const groups = groupNodeReferencesByFile({project, nodes});
	const edits = [...groups].map(([filePath, nodePaths]) => ({
		filePath,
		...duplicateNodesInSource({
			input: project.files[filePath],
			nodePaths,
		}),
	}));
	const result = getNodeEditResult({project, edits});
	return {
		...result,
		editDetails: edits.map(({filePath, nodeLabels, logLines}) => ({
			filePath,
			nodeLabels,
			logLines,
		})),
		insertedNodes: getInsertedNodeReferences(result.nodePathRemappings),
		duplicatedNodes: edits.flatMap(({filePath, duplicatedNodePaths}) =>
			duplicatedNodePaths.map((nodePath) => ({filePath, nodePath})),
		),
	};
};

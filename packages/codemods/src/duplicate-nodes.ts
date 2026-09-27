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
	editDetails: {filePath: string; nodeLabels: string[]; logLines: number[]}[];
};

export const duplicateNodes = async <Project extends CodemodProject>({
	project,
	nodes,
}: DuplicateNodesOptions<Project>): Promise<DuplicateNodesResult> => {
	const groups = groupNodeReferencesByFile({project, nodes});
	const edits = await Promise.all(
		[...groups].map(async ([filePath, nodePaths]) => ({
			filePath,
			...(await duplicateNodesInSource({
				input: project.files[filePath],
				nodePaths,
			})),
		})),
	);
	const result = getNodeEditResult({project, edits});
	return {
		...result,
		editDetails: edits.map(({filePath, nodeLabels, logLines}) => ({
			filePath,
			nodeLabels,
			logLines,
		})),
		insertedNodes: getInsertedNodeReferences(result.nodePathRemappings),
	};
};

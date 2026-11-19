import type {CodemodProject} from './codemod-project';
import {deleteNodes as deleteJsxNodesFromSource} from './delete-jsx-nodes-internal';
import {
	getNodeEditResult,
	groupNodeReferencesByFile,
	type CodemodNodeResult,
	type NodeReference,
} from './node-references';

export type DeleteNodesOptions<Project extends CodemodProject> = {
	project: Project;
	nodes: NodeReference[];
};

export const deleteNodes = <Project extends CodemodProject>({
	project,
	nodes,
}: DeleteNodesOptions<Project>): CodemodNodeResult & {
	editDetails: {
		filePath: string;
		formatted: boolean;
		nodeLabels: string[];
		logLines: number[];
	}[];
} => {
	const groups = groupNodeReferencesByFile({project, nodes});
	const edits = [...groups].map(([filePath, nodePaths]) => ({
		filePath,
		...deleteJsxNodesFromSource({
			input: project.files[filePath],
			nodePaths,
		}),
	}));
	return {
		...getNodeEditResult({project, edits}),
		editDetails: edits.map(({filePath, formatted, nodeLabels, logLines}) => ({
			filePath,
			formatted,
			nodeLabels,
			logLines,
		})),
	};
};

import type {CodemodProject} from './codemod-project';
import {duplicateJsxNodes as duplicateNodesInSource} from './duplicate-jsx-node';
import {
	getNodeEditResult,
	getInsertedNodeReferences,
	groupNodeReferencesByFile,
	type CodemodNodeResult,
	type JsxNodeReference,
} from './node-references';

export type DuplicateJsxNodesOptions<Project extends CodemodProject> = {
	project: Project;
	nodes: JsxNodeReference[];
};

export type DuplicateJsxNodesResult<Project extends CodemodProject> =
	CodemodNodeResult<Project> & {
		insertedNodes: JsxNodeReference[];
		editDetails: {filePath: string; nodeLabels: string[]; logLines: number[]}[];
	};

export const duplicateJsxNodes = async <Project extends CodemodProject>({
	project,
	nodes,
}: DuplicateJsxNodesOptions<Project>): Promise<
	DuplicateJsxNodesResult<Project>
> => {
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

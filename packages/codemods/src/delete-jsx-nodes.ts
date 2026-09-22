import type {CodemodProject} from './codemod-project';
import {deleteJsxNodes as deleteJsxNodesFromSource} from './delete-jsx-nodes-internal';
import {
	getNodeEditResult,
	groupNodeReferencesByFile,
	type CodemodNodeResult,
	type JsxNodeReference,
} from './node-references';

export type DeleteJsxNodesOptions<Project extends CodemodProject> = {
	project: Project;
	nodes: JsxNodeReference[];
};

export const deleteJsxNodes = async <Project extends CodemodProject>({
	project,
	nodes,
}: DeleteJsxNodesOptions<Project>): Promise<CodemodNodeResult<Project>> => {
	const groups = groupNodeReferencesByFile({project, nodes});
	const edits = await Promise.all(
		[...groups].map(async ([filePath, nodePaths]) => ({
			filePath,
			...(await deleteJsxNodesFromSource({
				input: project.files[filePath],
				nodePaths,
			})),
		})),
	);
	return getNodeEditResult({project, edits});
};

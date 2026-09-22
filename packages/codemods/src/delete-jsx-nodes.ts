import type {SequenceNodePath} from 'remotion';
import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {deleteJsxNodes as deleteJsxNodesFromSource} from './delete-jsx-nodes-internal';
import {findProjectFile} from './internals';

export type DeleteJsxNodesOptions<Project extends CodemodProject> = {
	project: Project;
	nodes: {filePath: string; nodePath: SequenceNodePath}[];
};

export const deleteJsxNodes = async <Project extends CodemodProject>({
	project,
	nodes,
}: DeleteJsxNodesOptions<Project>): Promise<CodemodResult<Project>> => {
	if (nodes.length === 0) {
		throw new Error('No JSX nodes were specified for deletion');
	}

	const nodesByFile = new Map<string, SequenceNodePath[]>();
	for (const node of nodes) {
		const resolvedFilePath = findProjectFile({
			filePath: node.filePath,
			project,
		});
		const nodePaths = nodesByFile.get(resolvedFilePath) ?? [];
		nodePaths.push(node.nodePath);
		nodesByFile.set(resolvedFilePath, nodePaths);
	}

	const updates = await Promise.all(
		[...nodesByFile].map(async ([filePath, nodePaths]) => ({
			filePath,
			output: (
				await deleteJsxNodesFromSource({
					input: project.files[filePath],
					nodePaths,
				})
			).output,
		})),
	);
	const nextProject = {
		...project,
		files: {
			...project.files,
			...Object.fromEntries(
				updates.map(({filePath, output}) => [filePath, output]),
			),
		},
	};

	return getCodemodResult({nextProject, project});
};

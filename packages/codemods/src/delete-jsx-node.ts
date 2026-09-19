import type {SequenceNodePath} from 'remotion';
import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {deleteJsxNode as deleteJsxNodeFromSource} from './delete-jsx-node-internal';
import {findProjectFile} from './internals';

export type DeleteJsxNodeOptions<Project extends CodemodProject> = {
	project: Project;
	filePath: string;
	nodePath: SequenceNodePath;
};

export const deleteJsxNode = async <Project extends CodemodProject>({
	project,
	filePath,
	nodePath,
}: DeleteJsxNodeOptions<Project>): Promise<CodemodResult<Project>> => {
	const resolvedFilePath = findProjectFile({filePath, project});
	const {output} = await deleteJsxNodeFromSource({
		input: project.files[resolvedFilePath],
		nodePath,
	});
	const nextProject = {
		...project,
		files: {
			...project.files,
			[resolvedFilePath]: output,
		},
	};

	return getCodemodResult({nextProject, project});
};

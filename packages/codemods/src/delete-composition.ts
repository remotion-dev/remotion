import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {
	type CompositionTarget,
	requireComposition,
} from './composition-editing';
import {
	findJsxElementPathForDeletion,
	getNodeSourceEdit,
} from './delete-jsx-nodes-internal';
import {parseAst} from './sequence-props/parse-ast';
import {applySourceEdits} from './source-edits';

export type DeleteCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {project: Project};

export const deleteComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
}: DeleteCompositionOptions<Project>): CodemodResult<Project> => {
	const node = requireComposition({project, compositionFile, compositionId});
	const input = project.files[node.filePath];
	const ast = parseAst(input);
	const jsxPath = findJsxElementPathForDeletion(ast, node.nodePath);
	if (!jsxPath) {
		throw new Error('Could not locate the composition to delete');
	}

	const output = applySourceEdits({
		input,
		edits: [getNodeSourceEdit({input, jsxPath})],
	});
	return getCodemodResult({
		project,
		nextProject: {
			...project,
			files: {...project.files, [node.filePath]: output},
		},
	});
};

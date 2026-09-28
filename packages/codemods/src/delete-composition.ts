import type {JSXElement} from '@babel/types';
import type {CodemodProject} from './codemod-project';
import {
	type CompositionTarget,
	requireComposition,
} from './composition-editing';
import {
	findJsxElementPathForDeletion,
	getNodeSourceEdit,
} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	collectJsxSubtree,
} from './get-node-path-remappings';
import {
	getNodeEditResult,
	getSubtreeEditRemappings,
	type CodemodNodeResult,
} from './node-references';
import {parseAst} from './sequence-props/parse-ast';
import {applySourceEdits} from './source-edits';

export type DeleteCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {project: Project};

export const deleteComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
}: DeleteCompositionOptions<Project>): CodemodNodeResult => {
	const node = requireComposition({project, compositionFile, compositionId});
	const input = project.files[node.filePath];
	const ast = parseAst(input);
	const jsxPath = findJsxElementPathForDeletion(ast, node.nodePath);
	if (!jsxPath) {
		throw new Error('Could not locate the composition to delete');
	}

	const before = captureJsxNodePaths(ast);
	const output = applySourceEdits({
		input,
		edits: [getNodeSourceEdit({input, jsxPath})],
	});
	const nodePathRemappings = getSubtreeEditRemappings({
		before,
		after: captureJsxNodePaths(parseAst(output)),
		subtrees: [
			{
				before: collectJsxSubtree(
					before,
					(jsxPath.node as JSXElement).openingElement,
				),
				after: new Set(),
			},
		],
	});
	return getNodeEditResult({
		project,
		edits: [{filePath: node.filePath, output, nodePathRemappings}],
	});
};

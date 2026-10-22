import type {AddFolderOptions} from './add-folder';
import type {CodemodProject} from './codemod-project';
import {requireTreeItem, getTreeEntries} from './folder-editing';
import {getUnwrapFolderSourceEdit} from './folder-source-edits';
import {captureJsxNodePaths} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getSubtreeEditRemappings,
	type CodemodNodeResult,
} from './node-references';
import {parseAst} from './sequence-props/parse-ast';
import {applySourceEdits} from './source-edits';

export type UnwrapFolderOptions<Project extends CodemodProject> =
	AddFolderOptions<Project>;

export const unwrapFolder = <Project extends CodemodProject>({
	project,
	compositionFile,
	folder,
}: UnwrapFolderOptions<Project>): CodemodNodeResult => {
	const filePath = findProjectFile({project, filePath: compositionFile});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const located = requireTreeItem(getTreeEntries({ast}), {
		type: 'folder',
		...folder,
	});
	const nextContents = applySourceEdits({
		input,
		edits: [getUnwrapFolderSourceEdit({input, located})],
	});
	// The folder's children stay in place, only its own element is removed.
	const nodePathRemappings = getSubtreeEditRemappings({
		before: captureJsxNodePaths(ast),
		after: captureJsxNodePaths(parseAst(nextContents)),
		subtrees: [
			{before: new Set([located.node.openingElement]), after: new Set()},
		],
	});
	return getNodeEditResult({
		project,
		edits: [{filePath, output: nextContents, nodePathRemappings}],
	});
};

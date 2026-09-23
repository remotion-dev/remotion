import type {AddFolderOptions} from './add-folder';
import type {CodemodProject} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {requireTreeItem, getTreeEntries} from './folder-editing';
import {getUnwrapFolderSourceEdit} from './folder-source-edits';
import {findProjectFile} from './internals';
import {parseAst} from './sequence-props/parse-ast';
import {applySourceEdits} from './source-edits';

export type UnwrapFolderOptions<Project extends CodemodProject> =
	AddFolderOptions<Project>;

export const unwrapFolder = <Project extends CodemodProject>({
	project,
	compositionFile,
	folder,
}: UnwrapFolderOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: compositionFile});
	const input = project.files[filePath];
	const located = requireTreeItem(getTreeEntries({ast: parseAst(input)}), {
		type: 'folder',
		...folder,
	});
	const nextContents = applySourceEdits({
		input,
		edits: [getUnwrapFolderSourceEdit({input, located})],
	});
	parseAst(nextContents);
	return getCodemodResult({
		project,
		edits: [{filePath, nextContents}],
	});
};

import type {AddFolderOptions} from './add-folder';
import type {CodemodProject} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {getTreeEntries, requireTreeItem} from './folder-editing';
import {findProjectFile} from './internals';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	getJsxStringAttributeValueSourceEdit,
} from './source-edits';

export type RenameFolderOptions<Project extends CodemodProject> =
	AddFolderOptions<Project> & {newName: string};

export const renameFolder = <Project extends CodemodProject>({
	project,
	compositionFile,
	folder,
	newName,
}: RenameFolderOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: compositionFile});
	const input = project.files[filePath];
	const entries = getTreeEntries({ast: parseAst(input)});
	const located = requireTreeItem(entries, {type: 'folder', ...folder});
	if (newName === folder.name) {
		return getCodemodResult({project, nextProject: project});
	}

	if (!newName || newName.includes('/')) {
		throw new Error('Folder names must be non-empty and cannot contain /');
	}

	if (
		entries.some(
			({item}) =>
				item.type === 'folder' &&
				item.name === newName &&
				item.parentName === folder.parentName,
		)
	) {
		throw new Error('A folder with this name already exists in the parent');
	}

	const attribute = located.node.openingElement.attributes.find(
		(candidate) =>
			candidate.type === 'JSXAttribute' &&
			candidate.name.type === 'JSXIdentifier' &&
			candidate.name.name === 'name',
	);
	if (attribute?.type !== 'JSXAttribute')
		throw new Error('Could not locate the folder name');
	const nextContents = applySourceEdits({
		input,
		edits: [
			getJsxStringAttributeValueSourceEdit({
				attribute,
				input,
				newValue: newName,
			}),
		],
	});
	parseAst(nextContents);
	return getCodemodResult({
		project,
		nextProject: {
			...project,
			files: {...project.files, [filePath]: nextContents},
		},
	});
};

import * as recast from 'recast';
import type {CodemodProject} from './codemod-project';
import type {FolderReference} from './composition-editing';
import {
	getRegistrationInsertionResult,
	getTreeEntries,
	requireTreeItem,
} from './folder-editing';
import {findProjectFile} from './internals';
import type {CodemodInsertionResult} from './node-references';
import {getRegistrationInsertionSourceEdit} from './registration-source-edits';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
} from './source-edits';

export type AddFolderOptions<Project extends CodemodProject> = {
	project: Project;
	compositionFile: string;
	folder: FolderReference;
};

export const addFolder = <Project extends CodemodProject>({
	project,
	compositionFile,
	folder,
}: AddFolderOptions<Project>): CodemodInsertionResult => {
	if (!folder.name || folder.name.includes('/')) {
		throw new Error('Folder names must be non-empty and cannot contain /');
	}

	const filePath = findProjectFile({project, filePath: compositionFile});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const entries = getTreeEntries({ast});
	if (
		entries.some(
			({item}) =>
				item.type === 'folder' &&
				item.name === folder.name &&
				item.parentName === folder.parentName,
		)
	) {
		throw new Error('A folder with this name already exists in the parent');
	}

	if (folder.parentName !== null) {
		const parts = folder.parentName.split('/');
		const name = parts.pop()!;
		requireTreeItem(entries, {
			type: 'folder',
			name,
			parentName: parts.join('/') || null,
		});
	}

	const snapshots = captureImportSnapshots(ast);
	const localName = ensureNamedImport({
		ast,
		importedName: 'Folder',
		sourcePath: 'remotion',
		localName: 'Folder',
	});
	const b = recast.types.builders;
	const insertion = b.jsxElement(
		b.jsxOpeningElement(
			b.jsxIdentifier(localName),
			[b.jsxAttribute(b.jsxIdentifier('name'), b.stringLiteral(folder.name))],
			true,
		),
		null,
		[],
	);
	const parentParts = folder.parentName?.split('/') ?? [];
	const parentName = parentParts.pop();
	const nextContents = applySourceEdits({
		input,
		edits: [
			getRegistrationInsertionSourceEdit({
				input,
				ast,
				insertion: insertion as never,
				folder:
					parentName === undefined
						? null
						: {name: parentName, parentName: parentParts.join('/') || null},
			}),
			...getInsertImportSourceEdits({
				ast,
				input,
				snapshots,
				prettierConfigOverride: null,
			}),
		],
	});
	return getRegistrationInsertionResult({
		project,
		filePath,
		input,
		output: nextContents,
		inserted: {type: 'folder', ...folder},
	});
};

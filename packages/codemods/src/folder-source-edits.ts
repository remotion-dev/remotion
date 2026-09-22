import type {
	ArrowFunctionExpression,
	File,
	JSXElement,
	JSXFragment,
	ReturnStatement,
} from '@babel/types';
import type {CompositionOrFolder, RecastCodemod} from '@remotion/studio-shared';
import * as recast from 'recast';
import {getNodeSourceEdit} from './delete-jsx-nodes-internal';
import {getInsertionRootSourceEdit} from './insert-jsx-element';
import {indentInsertedJsx, printInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {
	applyCodemod,
	type Change,
	getCompositionIdFromJSXElement,
	getFolderNameFromJSXElement,
} from './recast-mods';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getAdjacentJsxInsertionSourceEdit,
	getInsertImportSourceEdits,
	getJsxElementSourceForInsertion,
	getJsxStringAttributeValueSourceEdit,
	type SourceEdit,
} from './source-edits';
import {getEndOfLine, getIndentationUnit, getLineIndent} from './source-style';

type FolderCodemod = Extract<
	RecastCodemod,
	{
		type:
			| 'delete-folder'
			| 'move-composition-or-folder'
			| 'move-composition-to-folder'
			| 'new-folder'
			| 'rename-folder';
	}
>;

type LocatedItem = {
	directJsxChild: boolean;
	node: JSXElement;
	parentFolderName: string | null;
	path: recast.types.NodePath;
};

const getLocatedItems = (ast: File): LocatedItem[] => {
	const items: LocatedItem[] = [];
	const folderStack: string[] = [];

	const visitJsxElement = (path: recast.types.NodePath) => {
		const node = path.node as JSXElement;
		const parent = path.parentPath?.node;
		const parentFolderName = folderStack.join('/') || null;
		items.push({
			directJsxChild:
				(parent?.type === 'JSXElement' || parent?.type === 'JSXFragment') &&
				parent.children.includes(node),
			node,
			parentFolderName,
			path,
		});

		const folderName = getFolderNameFromJSXElement(node);
		if (folderName !== null) {
			folderStack.push(folderName);
		}

		for (let index = 0; index < node.children.length; index++) {
			if (node.children[index].type === 'JSXElement') {
				visitJsxElement(path.get('children', index) as recast.types.NodePath);
			}
		}

		if (folderName !== null) {
			folderStack.pop();
		}
	};

	recast.types.visit(ast, {
		visitJSXElement(path) {
			visitJsxElement(path as unknown as recast.types.NodePath);
			return false;
		},
	});

	return items;
};

const matchesItem = ({
	item,
	located,
}: {
	item: CompositionOrFolder;
	located: LocatedItem;
}) => {
	if (item.type === 'composition') {
		return getCompositionIdFromJSXElement(located.node) === item.compositionId;
	}

	return (
		getFolderNameFromJSXElement(located.node) === item.folderName &&
		located.parentFolderName === item.parentName
	);
};

const getFolder = ({
	folderName,
	items,
	parentName,
}: {
	folderName: string;
	items: LocatedItem[];
	parentName: string | null;
}) =>
	items.find(
		(item) =>
			getFolderNameFromJSXElement(item.node) === folderName &&
			item.parentFolderName === parentName,
	) ?? null;

const getRegistrationRoot = (
	path: recast.types.NodePath,
): JSXElement | JSXFragment => {
	let currentPath: recast.types.NodePath | null = path;
	while (currentPath !== null) {
		const node = currentPath.node as ReturnStatement | ArrowFunctionExpression;
		if (
			node.type === 'ReturnStatement' &&
			(node.argument?.type === 'JSXElement' ||
				node.argument?.type === 'JSXFragment')
		) {
			return node.argument;
		}

		if (
			node.type === 'ArrowFunctionExpression' &&
			(node.body.type === 'JSXElement' || node.body.type === 'JSXFragment')
		) {
			return node.body;
		}

		currentPath = currentPath.parentPath ?? null;
	}

	throw new Error('Could not find a root JSX element');
};

const getNewFolderSourceEdits = ({
	ast,
	input,
}: {
	ast: File;
	input: string;
}): SourceEdit[] => {
	const snapshots = captureImportSnapshots(ast);
	const localName = ensureNamedImport({
		ast,
		importedName: 'Folder',
		sourcePath: 'remotion',
		localName: 'Folder',
	});
	let insertionEdit: SourceEdit | null = null;

	recast.types.visit(ast, {
		visitNode(path) {
			const {node} = path;
			if (node.type !== 'JSXElement' && node.type !== 'JSXFragment') {
				this.traverse(path);
				return undefined;
			}

			const jsxNode = node as JSXElement | JSXFragment;
			const inserted = jsxNode.children.find(
				(child) =>
					child.type === 'JSXElement' &&
					!child.loc &&
					getFolderNameFromJSXElement(child) !== null,
			);
			if (!inserted || inserted.type !== 'JSXElement') {
				this.traverse(path);
				return undefined;
			}

			inserted.openingElement.name = recast.types.builders.jsxIdentifier(
				localName,
			) as never;
			const root = jsxNode.loc
				? jsxNode
				: jsxNode.children.find(
						(child) =>
							(child.type === 'JSXElement' || child.type === 'JSXFragment') &&
							child.loc,
					);
			if (
				!root ||
				(root.type !== 'JSXElement' && root.type !== 'JSXFragment')
			) {
				throw new Error('Could not locate the folder insertion target');
			}

			insertionEdit = getInsertionRootSourceEdit({
				input,
				insertion: printInsertedJsx({
					element: inserted as never,
					input,
					prettierConfigOverride: null,
				}),
				root: root as never,
				nullRoot: null,
				prettierConfigOverride: null,
				insertInside: Boolean(jsxNode.loc),
			});
			return false;
		},
	});

	if (insertionEdit === null) {
		throw new Error('Could not locate the new folder');
	}

	return [
		insertionEdit,
		...getInsertImportSourceEdits({
			ast,
			input,
			snapshots,
			prettierConfigOverride: null,
		}),
	];
};

const getFolderNameAttribute = (folder: JSXElement) => {
	const attribute = folder.openingElement.attributes.find(
		(candidate) =>
			candidate.type === 'JSXAttribute' &&
			candidate.name.type === 'JSXIdentifier' &&
			candidate.name.name === 'name',
	);
	if (attribute?.type !== 'JSXAttribute') {
		throw new Error('Could not locate the folder name');
	}

	return attribute;
};

const normalizeBlock = (source: string) => {
	const lines = source.split(/\r?\n/);
	while (lines[0]?.trim() === '') {
		lines.shift();
	}

	while (lines.at(-1)?.trim() === '') {
		lines.pop();
	}

	const indents = lines
		.filter((line) => line.trim() !== '')
		.map((line) => line.match(/^[\t ]*/)?.[0] ?? '');
	let commonIndent = indents[0] ?? '';
	for (const indent of indents.slice(1)) {
		while (!indent.startsWith(commonIndent)) {
			commonIndent = commonIndent.slice(0, -1);
		}
	}

	return lines
		.map((line) => (line.trim() === '' ? '' : line.slice(commonIndent.length)))
		.join(getEndOfLine(source));
};

const isMeaningfulChild = (child: JSXElement['children'][number]) =>
	child.type !== 'JSXText' || child.value.trim() !== '';

const getDeleteFolderSourceEdit = ({
	input,
	located,
}: {
	input: string;
	located: LocatedItem;
}): SourceEdit => {
	const {node, path} = located;
	if (!node.loc) {
		throw new Error('Could not locate the folder to delete');
	}

	const openingEnd = node.openingElement.loc
		? recastLocToOffset(input, node.openingElement.loc.end)
		: null;
	const closingStart = node.closingElement?.loc
		? recastLocToOffset(input, node.closingElement.loc.start)
		: null;
	const inner =
		openingEnd === null || closingStart === null
			? ''
			: normalizeBlock(input.slice(openingEnd, closingStart));

	if (!located.directJsxChild) {
		const meaningfulChildren = node.children.filter(isMeaningfulChild);
		if (meaningfulChildren.length === 0) {
			return {
				start: recastLocToOffset(input, node.loc.start),
				end: recastLocToOffset(input, node.loc.end),
				replacement: 'null',
			};
		}

		if (
			meaningfulChildren.length === 1 &&
			(meaningfulChildren[0].type === 'JSXElement' ||
				meaningfulChildren[0].type === 'JSXFragment')
		) {
			return {
				start: recastLocToOffset(input, node.loc.start),
				end: recastLocToOffset(input, node.loc.end),
				replacement: inner,
			};
		}

		const rootIndent = getLineIndent({
			input,
			offset: recastLocToOffset(input, node.loc.start),
		});
		const endOfLine = getEndOfLine(input);
		const unit = getIndentationUnit(input, null);
		return {
			start: recastLocToOffset(input, node.loc.start),
			end: recastLocToOffset(input, node.loc.end),
			replacement: [
				'<>',
				indentInsertedJsx({
					indent: `${rootIndent}${unit}`,
					insertion: inner,
				}),
				`${rootIndent}</>`,
			].join(endOfLine),
		};
	}

	const deletion = getNodeSourceEdit({input, jsxPath: path});
	if (inner === '') {
		return deletion;
	}

	const nodeStart = recastLocToOffset(input, node.loc.start);
	const indent = getLineIndent({input, offset: nodeStart});
	return {
		...deletion,
		replacement: `${indentInsertedJsx({indent, insertion: inner})}${
			deletion.end > recastLocToOffset(input, node.loc.end)
				? getEndOfLine(input)
				: ''
		}`,
	};
};

const getMoveSourceEdits = ({
	codeMod,
	input,
	items,
}: {
	codeMod: Extract<
		FolderCodemod,
		{type: 'move-composition-or-folder' | 'move-composition-to-folder'}
	>;
	input: string;
	items: LocatedItem[];
}): SourceEdit[] => {
	const source =
		codeMod.type === 'move-composition-to-folder'
			? (items.find(
					(item) =>
						item.directJsxChild &&
						getCompositionIdFromJSXElement(item.node) === codeMod.idToMove,
				) ?? null)
			: (items.find(
					(item) =>
						item.directJsxChild &&
						matchesItem({item: codeMod.source, located: item}),
				) ?? null);
	if (source === null) {
		throw new Error('Could not locate the JSX element to move');
	}

	const insertion = getJsxElementSourceForInsertion({
		element: source.node,
		input,
	});
	let insertionEdit: SourceEdit;
	if (codeMod.type === 'move-composition-to-folder') {
		if (codeMod.folderName === null) {
			const root = getRegistrationRoot(source.path);
			insertionEdit = getInsertionRootSourceEdit({
				input,
				insertion,
				root: root as never,
				nullRoot: null,
				prettierConfigOverride: null,
				insertInside: root.type === 'JSXFragment',
			});
		} else {
			const destination = getFolder({
				folderName: codeMod.folderName,
				items,
				parentName: codeMod.parentName,
			});
			if (destination === null) {
				throw new Error('Could not locate the destination folder');
			}

			insertionEdit = getInsertionRootSourceEdit({
				input,
				insertion,
				root: destination.node as never,
				nullRoot: null,
				prettierConfigOverride: null,
				insertInside: true,
			});
		}
	} else if (codeMod.destination.type === 'root') {
		const root = getRegistrationRoot(source.path);
		insertionEdit = getInsertionRootSourceEdit({
			input,
			insertion,
			root: root as never,
			nullRoot: null,
			prettierConfigOverride: null,
			insertInside: root.type === 'JSXFragment',
		});
	} else if (codeMod.destination.type === 'folder') {
		const destination = getFolder({
			folderName: codeMod.destination.folderName,
			items,
			parentName: codeMod.destination.parentName,
		});
		if (destination === null) {
			throw new Error('Could not locate the destination folder');
		}

		insertionEdit = getInsertionRootSourceEdit({
			input,
			insertion,
			root: destination.node as never,
			nullRoot: null,
			prettierConfigOverride: null,
			insertInside: true,
		});
	} else {
		const {destination} = codeMod;
		const target =
			items.find(
				(item) =>
					item.directJsxChild &&
					matchesItem({item: destination.target, located: item}),
			) ?? null;
		if (target === null) {
			throw new Error('Could not locate the JSX reorder target');
		}

		insertionEdit = getAdjacentJsxInsertionSourceEdit({
			input,
			insertion,
			position: destination.type,
			target: target.node,
		});
	}

	return [getNodeSourceEdit({input, jsxPath: source.path}), insertionEdit];
};

export const editFolderInSource = ({
	codeMod,
	input,
}: {
	codeMod: FolderCodemod;
	input: string;
}): {changesMade: Change[]; newContents: string} => {
	const ast = parseAst(input);
	const items = getLocatedItems(ast);
	const folder =
		codeMod.type === 'rename-folder' || codeMod.type === 'delete-folder'
			? getFolder({
					folderName: codeMod.folderName,
					items,
					parentName: codeMod.parentName,
				})
			: null;
	const {newAst, changesMade} = applyCodemod({file: ast, codeMod});
	if (changesMade.length === 0) {
		throw new Error(
			'Unable to calculate the changes needed for this file. Edit the file manually.',
		);
	}

	let edits: SourceEdit[];
	if (codeMod.type === 'new-folder') {
		edits = getNewFolderSourceEdits({ast: newAst, input});
	} else if (codeMod.type === 'rename-folder') {
		if (folder === null) {
			throw new Error('Could not locate the folder to rename');
		}

		edits = [
			getJsxStringAttributeValueSourceEdit({
				attribute: getFolderNameAttribute(folder.node),
				input,
				newValue: codeMod.newName,
			}),
		];
	} else if (codeMod.type === 'delete-folder') {
		if (folder === null) {
			throw new Error('Could not locate the folder to delete');
		}

		edits = [getDeleteFolderSourceEdit({input, located: folder})];
	} else {
		edits = getMoveSourceEdits({codeMod, input, items});
	}

	return {changesMade, newContents: applySourceEdits({input, edits})};
};

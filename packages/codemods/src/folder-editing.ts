import type {File, JSXElement} from '@babel/types';
import * as recast from 'recast';
import type {CodemodProject} from './codemod-project';
import type {FolderReference} from './composition-editing';
import {
	findJsxElementPathForDeletion,
	getNodeSourceEdit,
} from './delete-jsx-nodes-internal';
import {getMoveTreeItemSourceEdits} from './folder-source-edits';
import {
	captureJsxNodePaths,
	collectJsxSubtree,
	requireCapturedNodePath,
} from './get-node-path-remappings';
import {getInsertionRootSourceEdit} from './insert-jsx-element';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getSubtreeEditRemappings,
	type CodemodInsertionResult,
	type CodemodNodeResult,
	type NodeReference,
} from './node-references';
import {
	findRegistrationRoot,
	getCompositionIdFromJSXElement,
	getFolderNameFromJSXElement,
} from './registration-source-edits';
import {getReadOnlySourceSnapshot} from './sequence-props-snapshot';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	getAdjacentJsxInsertionSourceEdit,
	getJsxElementSourceForInsertion,
} from './source-edits';
import {transferRegistrationImports} from './transfer-registration-imports';
import {removeUnusedImports} from './unused-imports';

export type CompositionTreeItem =
	| {type: 'composition'; compositionId: string}
	| ({type: 'folder'} & FolderReference);

export type CompositionDestination =
	| {type: 'root'}
	| {type: 'folder'; folder: FolderReference}
	| {type: 'before' | 'after'; target: CompositionTreeItem};

export type TreeEntry = {
	item: CompositionTreeItem;
	parentName: string | null;
	node: JSXElement;
	path: recast.types.NodePath;
	directJsxChild: boolean;
};

export const getTreeEntries = ({ast}: {ast: File}): TreeEntry[] => {
	const entries: TreeEntry[] = [];
	const folders: string[] = [];
	recast.visit(ast, {
		visitJSXElement(path) {
			const node = path.node as JSXElement;
			const name = getFolderNameFromJSXElement(node, ast);
			const compositionId = getCompositionIdFromJSXElement(node, ast);
			const parentName = folders.join('/') || null;
			const parent = path.parentPath?.node;
			const item: CompositionTreeItem | null =
				name !== null
					? {type: 'folder', name, parentName}
					: compositionId !== null
						? {type: 'composition', compositionId}
						: null;
			if (item) {
				entries.push({
					item,
					parentName,
					node,
					path: path as unknown as recast.types.NodePath,
					directJsxChild:
						(parent?.type === 'JSXElement' || parent?.type === 'JSXFragment') &&
						parent.children.includes(node),
				});
			}

			if (name !== null) folders.push(name);
			this.traverse(path);
			if (name !== null) folders.pop();
			return false;
		},
	});
	return entries;
};

const matchesTreeItem = (
	entry: CompositionTreeItem,
	item: CompositionTreeItem,
) =>
	item.type === 'composition'
		? entry.type === 'composition' && entry.compositionId === item.compositionId
		: entry.type === 'folder' &&
			entry.name === item.name &&
			entry.parentName === item.parentName;

export const requireTreeItem = (
	entries: TreeEntry[],
	item: CompositionTreeItem,
) => {
	const matches = entries.filter(({item: entry}) =>
		matchesTreeItem(entry, item),
	);
	if (matches.length !== 1) {
		throw new Error(
			`Expected one ${item.type} matching ${JSON.stringify(item)}, found ${matches.length}`,
		);
	}

	return matches[0];
};

// The result of inserting one registration element. The element is located in
// the output by its ID or folder reference, or as the last element appended to
// the folder or the registration root.
export const getRegistrationInsertionResult = ({
	project,
	filePath,
	input,
	output,
	inserted,
}: {
	project: CodemodProject;
	filePath: string;
	input: string;
	output: string;
	inserted:
		| CompositionTreeItem
		| {type: 'last-child'; folder: FolderReference | null};
}): CodemodInsertionResult => {
	const before = captureJsxNodePaths(getReadOnlySourceSnapshot(input).ast);
	const {ast: nextAst} = getReadOnlySourceSnapshot(output);
	const after = captureJsxNodePaths(nextAst);
	let element: JSXElement;
	if (inserted.type === 'last-child') {
		const root = findRegistrationRoot({ast: nextAst, folder: inserted.folder});
		const last = root.children
			.slice()
			.reverse()
			.find((child): child is JSXElement => child.type === 'JSXElement');
		if (!last) {
			throw new Error('Could not locate the inserted registration');
		}

		element = last;
	} else {
		element = requireTreeItem(getTreeEntries({ast: nextAst}), inserted).node;
	}

	const nodePathRemappings = getSubtreeEditRemappings({
		before,
		after,
		subtrees: [
			{
				before: new Set(),
				after: collectJsxSubtree(after, element.openingElement),
			},
		],
	});
	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output, nodePathRemappings}],
		}),
		insertedNode: {
			filePath,
			nodePath: requireCapturedNodePath(after, element.openingElement),
		},
	};
};

export const moveTreeItem = <Project extends CodemodProject>({
	project,
	compositionFile,
	source,
	destination,
	destinationFile,
}: {
	project: Project;
	compositionFile: string;
	source: CompositionTreeItem;
	destination: CompositionDestination;
	destinationFile: string | null;
}): CodemodNodeResult & {updatedNode: NodeReference} => {
	const filePath = findProjectFile({project, filePath: compositionFile});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const entries = getTreeEntries({ast});
	const entry = requireTreeItem(entries, source);
	const before = captureJsxNodePaths(ast);
	const targetItem =
		destination.type === 'root'
			? null
			: destination.type === 'folder'
				? {type: 'folder' as const, ...destination.folder}
				: destination.target;
	let targetFilePath =
		destinationFile === null
			? filePath
			: findProjectFile({project, filePath: destinationFile});
	if (
		destinationFile === null &&
		targetItem !== null &&
		!entries.some(({item}) => matchesTreeItem(item, targetItem))
	) {
		const matches = Object.entries(project.files).flatMap(
			([candidateFile, contents]) => {
				if (!/\.[cm]?[jt]sx?$/.test(candidateFile)) return [];
				let candidateEntries: TreeEntry[];
				try {
					candidateEntries =
						candidateFile === filePath
							? entries
							: getTreeEntries({ast: parseAst(contents)});
				} catch {
					return [];
				}

				return candidateEntries
					.filter(({item}) => matchesTreeItem(item, targetItem))
					.map(() => candidateFile);
			},
		);
		if (matches.length !== 1)
			throw new Error(
				`Expected one destination matching ${JSON.stringify(targetItem)}, found ${matches.length}. Specify destinationFile to disambiguate.`,
			);
		[targetFilePath] = matches;
	}

	const destinationInput = project.files[targetFilePath];
	const destinationAst =
		targetFilePath === filePath ? ast : parseAst(destinationInput);
	const destinationEntries =
		targetFilePath === filePath
			? entries
			: getTreeEntries({ast: destinationAst});
	const target =
		targetItem === null
			? null
			: requireTreeItem(destinationEntries, targetItem);
	const destinationParentName =
		destination.type === 'folder'
			? [destination.folder.parentName, destination.folder.name]
					.filter(Boolean)
					.join('/')
			: (target?.parentName ?? null);
	if (source.type === 'folder') {
		const sourcePath = [source.parentName, source.name]
			.filter(Boolean)
			.join('/');
		if (
			destinationParentName === sourcePath ||
			destinationParentName?.startsWith(`${sourcePath}/`)
		) {
			throw new Error('A folder cannot be moved inside itself');
		}

		if (
			destinationEntries.some(
				(candidate) =>
					candidate !== entry &&
					candidate.item.type === 'folder' &&
					candidate.item.name === source.name &&
					candidate.parentName === destinationParentName,
			)
		) {
			throw new Error(
				`A folder named "${source.name}" already exists in the destination`,
			);
		}
	}

	if (
		entry === target ||
		(targetFilePath === filePath &&
			(destination.type === 'folder' || destination.type === 'root') &&
			entry.parentName === destinationParentName)
	) {
		return {
			changes: [],
			nodePathRemappings: [],
			updatedNode: {
				filePath,
				nodePath: requireCapturedNodePath(before, entry.node.openingElement),
			},
		};
	}

	if (
		!entry.directJsxChild &&
		!(
			targetFilePath !== filePath &&
			(entry.path.parentPath?.node.type === 'ReturnStatement' ||
				entry.path.parentPath?.node.type === 'ArrowFunctionExpression')
		)
	)
		throw new Error(
			'Could not locate the JSX element to move as a direct JSX child',
		);
	if (
		target &&
		!target.directJsxChild &&
		!(
			destination.type === 'folder' &&
			(target.path.parentPath?.node.type === 'ReturnStatement' ||
				target.path.parentPath?.node.type === 'ArrowFunctionExpression')
		)
	)
		throw new Error(
			'Could not locate the JSX destination as a direct JSX child',
		);
	if (targetFilePath !== filePath) {
		const destinationBefore = captureJsxNodePaths(destinationAst);
		const transferred = transferRegistrationImports({
			input,
			ast,
			entry,
			filePath,
			destinationInput,
			destinationAst,
			destinationFile: targetFilePath,
		});
		const transferredEntry = findJsxElementPathForDeletion(
			parseAst(transferred.input),
			requireCapturedNodePath(before, entry.node.openingElement),
		);
		if (!transferredEntry)
			throw new Error(
				'Could not locate the registration after transferring imports',
			);

		const insertion = getJsxElementSourceForInsertion({
			input: transferred.input,
			element: transferredEntry.node as JSXElement,
		});
		const destinationRoot =
			target?.node ?? findRegistrationRoot({ast: destinationAst, folder: null});
		const insertionEdit =
			destination.type === 'before' || destination.type === 'after'
				? getAdjacentJsxInsertionSourceEdit({
						input: destinationInput,
						insertion,
						position: destination.type,
						target: target!.node,
					})
				: getInsertionRootSourceEdit({
						input: destinationInput,
						insertion,
						root: destinationRoot as never,
						nullRoot: null,
						prettierConfigOverride: null,
						insertInside:
							destination.type === 'folder' ||
							destinationRoot.type === 'JSXFragment',
					});
		const output = removeUnusedImports({
			input: applySourceEdits({
				input,
				edits: [getNodeSourceEdit({input, jsxPath: entry.path})],
			}),
			localNames: transferred.localNames,
		});
		const destinationOutput = applySourceEdits({
			input: destinationInput,
			edits: [...transferred.importEdits, insertionEdit],
		});
		const destinationNextAst = parseAst(destinationOutput);
		const destinationMovedEntry = requireTreeItem(
			getTreeEntries({ast: destinationNextAst}),
			source.type === 'composition'
				? source
				: {...source, parentName: destinationParentName},
		);
		const destinationAfter = captureJsxNodePaths(destinationNextAst);
		return {
			...getNodeEditResult({
				project,
				edits: [
					{
						filePath,
						output,
						nodePathRemappings: getSubtreeEditRemappings({
							before,
							after: captureJsxNodePaths(parseAst(output)),
							subtrees: [
								{
									before: collectJsxSubtree(before, entry.node.openingElement),
									after: new Set(),
								},
							],
						}),
					},
					{
						filePath: targetFilePath,
						output: destinationOutput,
						nodePathRemappings: getSubtreeEditRemappings({
							before: destinationBefore,
							after: destinationAfter,
							subtrees: [
								{
									before: new Set(),
									after: collectJsxSubtree(
										destinationAfter,
										destinationMovedEntry.node.openingElement,
									),
								},
							],
						}),
					},
				],
			}),
			updatedNode: {
				filePath: targetFilePath,
				nodePath: requireCapturedNodePath(
					destinationAfter,
					destinationMovedEntry.node.openingElement,
				),
			},
		};
	}

	const nextContents = applySourceEdits({
		input,
		edits: getMoveTreeItemSourceEdits({
			input,
			source: entry,
			target,
			position: destination.type,
		}),
	});
	const nextAst = parseAst(nextContents);
	const nextEntries = getTreeEntries({ast: nextAst});
	const movedEntry = requireTreeItem(
		nextEntries,
		source.type === 'composition'
			? source
			: {
					type: 'folder',
					name: source.name,
					parentName: destinationParentName,
				},
	);
	const after = captureJsxNodePaths(nextAst);
	const nodePathRemappings = getSubtreeEditRemappings({
		before,
		after,
		subtrees: [
			{
				before: collectJsxSubtree(before, entry.node.openingElement),
				after: collectJsxSubtree(after, movedEntry.node.openingElement),
			},
		],
	});

	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output: nextContents, nodePathRemappings}],
		}),
		updatedNode: {
			filePath,
			nodePath: requireCapturedNodePath(after, movedEntry.node.openingElement),
		},
	};
};

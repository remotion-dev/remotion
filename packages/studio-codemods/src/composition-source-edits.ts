import type {JSXElement} from '@babel/types';
import type {RecastCodemod} from '@remotion/studio-shared';
import {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {getNodeSourceEdit} from './delete-jsx-node';
import {getCompositionId} from './duplicate-composition';
import {getInsertionRootSourceEdit} from './insert-jsx-element';
import {printInsertedJsx} from './print-jsx';
import {applyCodemod, type Change} from './recast-mods';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
	getJsxStringAttributeValueSourceEdit,
	type SourceEdit,
} from './source-edits';

export const editCompositionInSource = ({
	input,
	codeMod,
}: {
	input: string;
	codeMod: Extract<
		RecastCodemod,
		{type: 'new-composition' | 'rename-composition' | 'delete-composition'}
	>;
}): {newContents: string; changesMade: Change[]} => {
	const ast = parseAst(input);
	const edits: SourceEdit[] = [];
	let changesMade: Change[] = [];
	if (codeMod.type === 'new-composition') {
		const snapshots = captureImportSnapshots(ast);
		const result = applyCodemod({file: ast, codeMod});
		changesMade = result.changesMade;
		const {newAst} = result;
		const tag =
			codeMod.canvasCapture === null
				? ensureNamedImport({
						ast: newAst,
						importedName: 'Composition',
						sourcePath: 'remotion',
						localName: 'Composition',
					})
				: null;
		const component = ensureNamedImport({
			ast: newAst,
			importedName: codeMod.componentName,
			sourcePath: codeMod.componentImportPath,
			localName: codeMod.componentName,
		});
		recast.types.visit(newAst, {
			visitNode(path) {
				const {node} = path;
				if (
					!namedTypes.JSXElement.check(node) &&
					!namedTypes.JSXFragment.check(node)
				) {
					this.traverse(path);
					return undefined;
				}

				const inserted = node.children?.find(
					(child) => child.type === 'JSXElement' && !child.loc,
				);
				if (!inserted || inserted.type !== 'JSXElement') {
					this.traverse(path);
					return undefined;
				}

				inserted.openingElement.name = recast.types.builders.jsxIdentifier(
					tag ?? component,
				);
				if (tag !== null) {
					const attribute = inserted.openingElement.attributes?.find(
						(attr) =>
							attr.type === 'JSXAttribute' && attr.name.name === 'component',
					);
					if (attribute?.type === 'JSXAttribute') {
						attribute.value = recast.types.builders.jsxExpressionContainer(
							recast.types.builders.identifier(component),
						);
					}
				}

				// A newly generated fragment wraps the existing lone root.
				const root = node.loc
					? node
					: node.children?.find(
							(child) => child.type === 'JSXElement' && child.loc,
						);
				if (
					!root ||
					(root.type !== 'JSXElement' && root.type !== 'JSXFragment')
				) {
					throw new Error('Could not locate the composition insertion target');
				}

				edits.push(
					getInsertionRootSourceEdit({
						input,
						insertion: printInsertedJsx({
							element: inserted,
							input,
							prettierConfigOverride: null,
						}),
						root,
						nullRoot: null,
						prettierConfigOverride: null,
						insertInside: Boolean(node.loc),
					}),
				);
				return false;
			},
		});
		edits.push(
			...getInsertImportSourceEdits({
				ast: newAst,
				input,
				snapshots,
				prettierConfigOverride: null,
			}),
		);
	} else {
		recast.types.visit(ast, {
			visitJSXElement(path) {
				const element = path.node as unknown as JSXElement;
				if (
					getCompositionId(element) !==
					(codeMod.type === 'rename-composition'
						? codeMod.idToRename
						: codeMod.idToDelete)
				) {
					this.traverse(path);
					return undefined;
				}

				if (codeMod.type === 'delete-composition') {
					edits.push(
						getNodeSourceEdit({input, jsxPath: path as recast.types.NodePath}),
					);
					changesMade.push({description: 'Deleted composition'});
					return false;
				}

				const attribute = element.openingElement.attributes.find(
					(attr) =>
						attr.type === 'JSXAttribute' &&
						attr.name.type === 'JSXIdentifier' &&
						attr.name.name === 'id',
				);
				if (attribute?.type !== 'JSXAttribute') {
					throw new Error('Could not locate the composition id');
				}

				edits.push(
					getJsxStringAttributeValueSourceEdit({
						attribute,
						input,
						newValue: codeMod.newId,
					}),
				);
				changesMade.push({description: 'Replaced composition id'});
				return false;
			},
		});
	}

	if (changesMade.length === 0) {
		throw new Error(
			'Unable to calculate the changes needed for this file. Edit the file manually.',
		);
	}

	return {newContents: applySourceEdits({input, edits}), changesMade};
};

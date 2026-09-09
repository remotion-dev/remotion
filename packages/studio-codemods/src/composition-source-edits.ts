import type {JSXElement} from '@babel/types';
import type {RecastCodemod} from '@remotion/studio-shared';
import {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {getNodeSourceEdit} from './delete-jsx-node';
import {getCompositionId} from './duplicate-composition';
import {
	applySourceEdits,
	getInsertImportSourceEdits,
	getInsertionRootSourceEdit,
	type SourceEdit,
} from './insert-jsx-element';
import {printInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {applyCodemod, type Change} from './recast-mods';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';

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
		const snapshots = ast.program.body.flatMap((statement) =>
			statement.type === 'ImportDeclaration'
				? [{declaration: statement, specifiers: [...statement.specifiers]}]
				: [],
		);
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
				const value =
					attribute?.type === 'JSXAttribute' ? attribute.value : null;
				const literal =
					value?.type === 'JSXExpressionContainer' ? value.expression : value;
				if (!literal?.loc || literal.type !== 'StringLiteral') {
					throw new Error('Could not locate the composition id');
				}

				const start = recastLocToOffset(input, literal.loc.start);
				const end = recastLocToOffset(input, literal.loc.end);
				const quote = input[start] === "'" ? "'" : '"';
				const replacement =
					value?.type === 'StringLiteral'
						? quote +
							codeMod.newId
								.replaceAll('&', '&amp;')
								.replaceAll('"', '&quot;')
								.replaceAll("'", '&apos;')
								.replaceAll('<', '&lt;') +
							quote
						: recast.prettyPrint(
								recast.types.builders.stringLiteral(codeMod.newId),
								{quote: quote === "'" ? 'single' : 'double'},
							).code;
				edits.push({start, end, replacement});
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

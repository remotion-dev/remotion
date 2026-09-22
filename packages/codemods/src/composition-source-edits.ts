import type {JSXElement} from '@babel/types';
import type {RecastCodemod} from '@remotion/studio-shared';
import {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {getNodeSourceEdit} from './delete-jsx-nodes-internal';
import {getCompositionId} from './duplicate-composition';
import {getInsertionRootSourceEdit} from './insert-jsx-element';
import {printInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
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
import {getEndOfLine, getIndentationUnit, getLineIndent} from './source-style';

export const editCompositionInSource = ({
	input,
	codeMod,
}: {
	input: string;
	codeMod: Extract<
		RecastCodemod,
		{
			type:
				| 'new-composition'
				| 'rename-composition'
				| 'delete-composition'
				| 'update-composition-metadata';
		}
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
				const compositionId =
					codeMod.type === 'rename-composition'
						? codeMod.idToRename
						: codeMod.type === 'delete-composition'
							? codeMod.idToDelete
							: codeMod.idToUpdate;
				if (getCompositionId(element) !== compositionId) {
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

				if (codeMod.type === 'update-composition-metadata') {
					const metadata = [
						{name: 'fps', value: codeMod.newFps, description: 'FPS'},
						{
							name: 'durationInFrames',
							value: codeMod.newDurationInFrames,
							description: 'durationInFrames',
						},
						{name: 'width', value: codeMod.newWidth, description: 'width'},
						{name: 'height', value: codeMod.newHeight, description: 'height'},
					] as const;
					const existingMetadata = new Set<string>();

					for (const metadataAttribute of element.openingElement.attributes) {
						if (
							metadataAttribute.type !== 'JSXAttribute' ||
							metadataAttribute.name.type !== 'JSXIdentifier'
						) {
							continue;
						}

						const update = metadata.find(
							(item) => item.name === metadataAttribute.name.name,
						);
						if (!update || update.value === null) {
							continue;
						}

						existingMetadata.add(update.name);
						if (metadataAttribute.value?.loc) {
							edits.push({
								start: recastLocToOffset(
									input,
									metadataAttribute.value.loc.start,
								),
								end: recastLocToOffset(input, metadataAttribute.value.loc.end),
								replacement: `{${update.value}}`,
							});
						} else if (metadataAttribute.loc) {
							const offset = recastLocToOffset(
								input,
								metadataAttribute.loc.end,
							);
							edits.push({
								start: offset,
								end: offset,
								replacement: `={${update.value}}`,
							});
						} else {
							throw new Error(
								`Could not locate the "${update.name}" attribute`,
							);
						}

						changesMade.push({
							description: `Replaced ${update.description}`,
						});
					}

					const missingMetadata = metadata.filter(
						(item) => item.value !== null && !existingMetadata.has(item.name),
					);
					if (missingMetadata.length > 0) {
						const {openingElement} = element;
						if (!openingElement.loc || !openingElement.name.loc) {
							throw new Error(
								'Could not locate the composition opening element',
							);
						}

						const openingEnd = recastLocToOffset(input, openingElement.loc.end);
						const closingStart =
							openingEnd - (openingElement.selfClosing ? 2 : 1);
						const lastAttribute = openingElement.attributes.findLast(
							(candidate) => candidate.loc,
						);
						const anchor =
							lastAttribute?.loc?.end ?? openingElement.name.loc.end;
						const anchorOffset = recastLocToOffset(input, anchor);
						const rendered = missingMetadata.map(
							(item) => `${item.name}={${item.value}}`,
						);

						if (input.slice(anchorOffset, closingStart).includes('\n')) {
							const closingLineStart =
								input.lastIndexOf('\n', closingStart - 1) + 1;
							const attributeIndent =
								lastAttribute?.loc &&
								lastAttribute.loc.start.line > openingElement.name.loc.end.line
									? getLineIndent({
											input,
											offset: recastLocToOffset(input, lastAttribute.loc.start),
										})
									: getLineIndent({
											input,
											offset: recastLocToOffset(
												input,
												openingElement.loc.start,
											),
										}) + getIndentationUnit(input, null);
							const endOfLine = getEndOfLine(input);
							edits.push({
								start: closingLineStart,
								end: closingLineStart,
								replacement:
									rendered
										.map(
											(renderedAttribute) =>
												`${attributeIndent}${renderedAttribute}`,
										)
										.join(endOfLine) + endOfLine,
							});
						} else {
							edits.push({
								start: anchorOffset,
								end: anchorOffset,
								replacement: ` ${rendered.join(' ')}`,
							});
						}

						for (const item of missingMetadata) {
							changesMade.push({description: `Added ${item.description}`});
						}
					}

					return false;
				}

				const idAttribute = element.openingElement.attributes.find(
					(attr) =>
						attr.type === 'JSXAttribute' &&
						attr.name.type === 'JSXIdentifier' &&
						attr.name.name === 'id',
				);
				if (idAttribute?.type !== 'JSXAttribute') {
					throw new Error('Could not locate the composition id');
				}

				edits.push(
					getJsxStringAttributeValueSourceEdit({
						attribute: idAttribute,
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

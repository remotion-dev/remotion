import type {JSXAttribute, JSXElement, JSXOpeningElement} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import type {CompositionMetadata} from './composition-editing';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {getInsertionRootSourceEdit} from './insert-jsx-element';
import {indentInsertedJsx, printInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
	type SourceEdit,
} from './source-edits';

const b = recast.types.builders;

const changeComposition = ({
	jsxElement,
	newId,
	tag,
	tagName,
	metadata,
}: {
	jsxElement: JSXElement;
	newId: string;
	tag: 'Composition' | 'Still';
	tagName: string;
	metadata: Partial<CompositionMetadata>;
}): JSXElement => {
	const {openingElement} = jsxElement;

	const attributes = openingElement.attributes
		.map((attribute) => {
			if (
				attribute.type !== 'JSXAttribute' ||
				attribute.name.type !== 'JSXIdentifier'
			) {
				return attribute;
			}

			if (
				tag === 'Still' &&
				(attribute.name.name === 'fps' ||
					attribute.name.name === 'durationInFrames')
			) {
				return null;
			}

			if (
				attribute.name.name === 'id' &&
				attribute.value?.type === 'StringLiteral'
			) {
				return {
					...attribute,
					value: {...attribute.value, value: newId},
				};
			}

			if (
				attribute.name.name === 'id' &&
				attribute.value?.type === 'JSXExpressionContainer' &&
				attribute.value.expression.type === 'StringLiteral'
			) {
				return {
					...attribute,
					value: {
						...attribute.value,
						expression: {
							...attribute.value.expression,
							value: newId,
						},
					},
				};
			}

			const newValue =
				attribute.name.name === 'fps'
					? (metadata.fps ?? null)
					: attribute.name.name === 'durationInFrames'
						? (metadata.durationInFrames ?? null)
						: attribute.name.name === 'width'
							? (metadata.width ?? null)
							: attribute.name.name === 'height'
								? (metadata.height ?? null)
								: null;
			if (newValue === null) {
				return attribute;
			}

			return {
				...attribute,
				value: b.jsxExpressionContainer(
					b.numericLiteral(newValue),
				) as unknown as JSXAttribute['value'],
			};
		})
		.filter((attribute): attribute is NonNullable<typeof attribute> =>
			Boolean(attribute),
		) as JSXOpeningElement['attributes'];

	for (const [nameToAdd, value] of [
		['fps', metadata.fps ?? null],
		['durationInFrames', metadata.durationInFrames ?? null],
		['width', metadata.width ?? null],
		['height', metadata.height ?? null],
	] as const) {
		if (
			value === null ||
			(tag === 'Still' &&
				(nameToAdd === 'fps' || nameToAdd === 'durationInFrames')) ||
			attributes.some(
				(attribute) =>
					attribute.type === 'JSXAttribute' &&
					attribute.name.type === 'JSXIdentifier' &&
					attribute.name.name === nameToAdd,
			)
		) {
			continue;
		}

		attributes.push(
			b.jsxAttribute(
				b.jsxIdentifier(nameToAdd),
				b.jsxExpressionContainer(b.numericLiteral(value)),
			) as JSXAttribute,
		);
	}

	return {
		...jsxElement,
		closingElement: jsxElement.closingElement
			? {
					...jsxElement.closingElement,
					name: {type: 'JSXIdentifier', name: tagName},
				}
			: null,
		openingElement: {
			...openingElement,
			name: {type: 'JSXIdentifier', name: tagName},
			attributes,
		},
	};
};

export const duplicateCompositionInSource = ({
	input,
	nodePath,
	newId,
	tag,
	metadata,
}: {
	input: string;
	nodePath: SequenceNodePath;
	newId: string;
	tag: 'Composition' | 'Still';
	metadata: Partial<CompositionMetadata>;
}): string => {
	const ast = parseAst(input);
	const snapshots = captureImportSnapshots(ast);
	const astPath = findJsxElementPathForDeletion(ast, nodePath);
	const original = astPath?.node as JSXElement | undefined;
	if (!astPath || !original?.loc) {
		throw new Error('Could not locate the composition to duplicate');
	}

	const tagName = ensureNamedImport({
		ast,
		importedName: tag,
		sourcePath: 'remotion',
		localName: tag,
	});
	const duplicate = changeComposition({
		jsxElement: original,
		newId,
		tag,
		tagName,
		metadata,
	});
	const insertion = printInsertedJsx({
		element: duplicate as never,
		input,
		prettierConfigOverride: null,
	});
	const parent = astPath.parentPath?.node;
	let insertionEdit: SourceEdit;
	if (
		parent &&
		(parent.type === 'JSXElement' || parent.type === 'JSXFragment')
	) {
		const end = recastLocToOffset(input, original.loc.end);
		const start = recastLocToOffset(input, original.loc.start);
		const lineStart = input.lastIndexOf('\n', start - 1) + 1;
		const indent = input.slice(lineStart, start).match(/^[\t ]*/)?.[0] ?? '';
		const endOfLine = input.includes('\r\n') ? '\r\n' : '\n';
		insertionEdit = {
			start: end,
			end,
			replacement: endOfLine + indentInsertedJsx({indent, insertion}),
		};
	} else {
		insertionEdit = getInsertionRootSourceEdit({
			input,
			insertion,
			root: original as never,
			nullRoot: null,
			prettierConfigOverride: null,
			insertInside: false,
		});
	}

	return applySourceEdits({
		input,
		edits: [
			insertionEdit,
			...getInsertImportSourceEdits({
				ast,
				input,
				snapshots,
				prettierConfigOverride: null,
			}),
		],
	});
};

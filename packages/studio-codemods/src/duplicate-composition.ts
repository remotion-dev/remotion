import type {
	Expression,
	JSXAttribute,
	JSXElement,
	JSXIdentifier,
	JSXOpeningElement,
} from '@babel/types';
import type {RecastCodemod} from '@remotion/studio-shared';
import * as recast from 'recast';
import {
	applySourceEdits,
	getInsertImportSourceEdits,
	getInsertionRootSourceEdit,
	type SourceEdit,
} from './insert-jsx-element';
import {indentInsertedJsx, printInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';

const b = recast.types.builders;

type DuplicateCompositionCodemod = Extract<
	RecastCodemod,
	{type: 'duplicate-composition'}
>;

export const getCompositionId = (jsxElement: JSXElement) => {
	const {openingElement} = jsxElement;
	if (
		openingElement.name.type !== 'JSXIdentifier' ||
		(openingElement.name.name !== 'Composition' &&
			openingElement.name.name !== 'Still')
	) {
		return null;
	}

	for (const attribute of openingElement.attributes) {
		const value = attribute.type === 'JSXAttribute' ? attribute.value : null;
		if (
			attribute.type !== 'JSXAttribute' ||
			attribute.name.type !== 'JSXIdentifier' ||
			attribute.name.name !== 'id' ||
			!value
		) {
			continue;
		}

		if (value.type === 'StringLiteral') {
			return value.value;
		}

		if (
			value.type === 'JSXExpressionContainer' &&
			value.expression.type === 'StringLiteral'
		) {
			return value.expression.value;
		}
	}

	return null;
};

const jsxId = (name: string): JSXIdentifier => ({type: 'JSXIdentifier', name});

const jsxAttributeWithExpression = (
	name: string,
	expression: Expression,
): JSXAttribute => ({
	type: 'JSXAttribute',
	name: jsxId(name),
	value: {
		type: 'JSXExpressionContainer',
		expression,
	},
});

const changeComposition = ({
	jsxElement,
	codemod,
	changesMade,
}: {
	jsxElement: JSXElement;
	codemod: DuplicateCompositionCodemod;
	changesMade: {description: string}[];
}): JSXElement => {
	const {openingElement} = jsxElement;
	const {name} = openingElement;
	if (name.type !== 'JSXIdentifier') {
		return jsxElement;
	}

	const attributes = openingElement.attributes
		.map((attribute) => {
			if (
				attribute.type !== 'JSXAttribute' ||
				attribute.name.type !== 'JSXIdentifier'
			) {
				return attribute;
			}

			if (
				codemod.tag === 'Still' &&
				(attribute.name.name === 'fps' ||
					attribute.name.name === 'durationInFrames')
			) {
				changesMade.push({description: `Removed ${attribute.name.name}`});
				return null;
			}

			if (
				attribute.name.name === 'id' &&
				attribute.value?.type === 'StringLiteral'
			) {
				changesMade.push({description: 'Replaced composition id'});
				return {
					...attribute,
					value: {...attribute.value, value: codemod.newId},
				};
			}

			if (
				attribute.name.name === 'id' &&
				attribute.value?.type === 'JSXExpressionContainer' &&
				attribute.value.expression.type === 'StringLiteral'
			) {
				changesMade.push({description: 'Replaced composition id'});
				return {
					...attribute,
					value: {
						...attribute.value,
						expression: {
							...attribute.value.expression,
							value: codemod.newId,
						},
					},
				};
			}

			const newValue =
				attribute.name.name === 'fps'
					? codemod.newFps
					: attribute.name.name === 'durationInFrames'
						? codemod.newDurationInFrames
						: attribute.name.name === 'width'
							? codemod.newWidth
							: attribute.name.name === 'height'
								? codemod.newHeight
								: null;
			if (newValue === null) {
				return attribute;
			}

			changesMade.push({description: `Replaced ${attribute.name.name}`});
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
		['fps', codemod.newFps],
		['durationInFrames', codemod.newDurationInFrames],
		['width', codemod.newWidth],
		['height', codemod.newHeight],
	] as const) {
		if (
			value === null ||
			(codemod.tag === 'Still' &&
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

		changesMade.push({description: `Added ${nameToAdd}`});
		attributes.push(
			jsxAttributeWithExpression(
				nameToAdd,
				b.numericLiteral(value) as Expression,
			),
		);
	}

	if (codemod.tag !== name.name) {
		changesMade.push({description: 'Changed tag'});
	}

	return {
		...jsxElement,
		closingElement: jsxElement.closingElement
			? {...jsxElement.closingElement, name: {...name, name: codemod.tag}}
			: null,
		openingElement: {
			...openingElement,
			name: {...name, name: codemod.tag},
			attributes,
		},
	};
};

export const duplicateCompositionInSource = ({
	input,
	codemod,
}: {
	input: string;
	codemod: DuplicateCompositionCodemod;
}): {newContents: string; changesMade: {description: string}[]} => {
	const ast = parseAst(input);
	const changesMade: {description: string}[] = [];
	const edits: SourceEdit[] = [];
	const snapshots = ast.program.body.flatMap((statement) =>
		statement.type === 'ImportDeclaration'
			? [{declaration: statement, specifiers: [...statement.specifiers]}]
			: [],
	);

	recast.types.visit(ast, {
		visitJSXElement(astPath) {
			const original = astPath.node as unknown as JSXElement;
			if (getCompositionId(original) !== codemod.idToDuplicate) {
				this.traverse(astPath);
				return undefined;
			}

			const duplicate = changeComposition({
				jsxElement: original,
				codemod,
				changesMade,
			});
			if (!original.loc) {
				throw new Error('Could not locate the composition to duplicate');
			}

			const insertion = printInsertedJsx({
				element: duplicate as never,
				input,
				prettierConfigOverride: null,
			});
			const parent = astPath.parentPath?.node;
			if (
				parent &&
				(parent.type === 'JSXElement' || parent.type === 'JSXFragment')
			) {
				const end = recastLocToOffset(input, original.loc.end);
				const start = recastLocToOffset(input, original.loc.start);
				const lineStart = input.lastIndexOf('\n', start - 1) + 1;
				const indent =
					input.slice(lineStart, start).match(/^[\t ]*/)?.[0] ?? '';
				const endOfLine = input.includes('\r\n') ? '\r\n' : '\n';
				edits.push({
					start: end,
					end,
					replacement: endOfLine + indentInsertedJsx({indent, insertion}),
				});
			} else {
				edits.push(
					getInsertionRootSourceEdit({
						input,
						insertion,
						root: original as never,
						nullRoot: null,
						prettierConfigOverride: null,
						insertInside: false,
					}),
				);
			}

			return false;
		},
	});

	if (changesMade.length === 0) {
		throw new Error(
			`Could not find composition "${codemod.idToDuplicate}" to duplicate`,
		);
	}

	ensureNamedImport({
		ast,
		importedName: codemod.tag,
		sourcePath: 'remotion',
		localName: codemod.tag,
	});

	return {
		newContents: applySourceEdits({
			input,
			edits: [
				...edits,
				...getInsertImportSourceEdits({
					ast,
					input,
					snapshots,
					prettierConfigOverride: null,
				}),
			],
		}),
		changesMade,
	};
};

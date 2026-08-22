import type {
	Expression,
	JSXAttribute,
	JSXElement,
	JSXFragment,
	JSXIdentifier,
	JSXOpeningElement,
} from '@babel/types';
import type {RecastCodemod} from '@remotion/studio-shared';
import * as recast from 'recast';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst, serializeAst} from './sequence-props/parse-ast';

const b = recast.types.builders;

type DuplicateCompositionCodemod = Extract<
	RecastCodemod,
	{type: 'duplicate-composition'}
>;

const getCompositionId = (jsxElement: JSXElement) => {
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
		openingElement: {
			...openingElement,
			name: {...name, name: codemod.tag},
			attributes,
		},
	};
};

const makeFragment = (
	original: JSXElement,
	duplicate: JSXElement,
): JSXFragment => ({
	type: 'JSXFragment',
	openingFragment: {type: 'JSXOpeningFragment'},
	closingFragment: {type: 'JSXClosingFragment'},
	children: [original, duplicate],
});

const insertAfterInJsxParent = ({
	duplicate,
	original,
	parent,
}: {
	duplicate: JSXElement;
	original: JSXElement;
	parent: JSXElement | JSXFragment;
}) => {
	const index = parent.children.indexOf(original);
	if (index === -1) {
		return false;
	}

	parent.children.splice(index + 1, 0, duplicate);
	return true;
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
	const generatedNodes = new WeakSet<JSXElement>();

	recast.types.visit(ast, {
		visitJSXElement(astPath) {
			const original = astPath.node as unknown as JSXElement;
			if (
				generatedNodes.has(original) ||
				getCompositionId(original) !== codemod.idToDuplicate
			) {
				this.traverse(astPath);
				return undefined;
			}

			const duplicate = changeComposition({
				jsxElement: original,
				codemod,
				changesMade,
			});
			generatedNodes.add(duplicate);
			const parent = astPath.parentPath?.node as
				| JSXElement
				| JSXFragment
				| undefined;
			if (
				parent &&
				(parent.type === 'JSXElement' || parent.type === 'JSXFragment') &&
				insertAfterInJsxParent({duplicate, original, parent})
			) {
				return false;
			}

			astPath.replace(makeFragment(original, duplicate));
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

	return {newContents: serializeAst(ast), changesMade};
};

import type {
	ArrowFunctionExpression,
	Expression,
	JSXAttribute,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
	JSXIdentifier,
	JSXMemberExpression,
	JSXNamespacedName,
	Node,
	ReturnStatement,
} from '@babel/types';
import {cloneNode} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} from './delete-jsx-node';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';

const {builders: b, namedTypes} = recast.types;

type SequenceTiming = {
	from: number;
	durationInFrames: number;
	trimBefore: number;
	hasFrom: boolean;
	hasDurationInFrames: boolean;
	hasTrimBefore: boolean;
};

const jsxId = (name: string) => ({type: 'JSXIdentifier' as const, name});

const numericAttribute = (name: string, value: number): JSXAttribute => ({
	type: 'JSXAttribute',
	name: jsxId(name),
	value: {
		type: 'JSXExpressionContainer',
		expression:
			value === Infinity ? b.identifier('Infinity') : b.numericLiteral(value),
	} as JSXExpressionContainer,
});

const getAttributeName = (
	attribute: JSXElement['openingElement']['attributes'][number],
) => {
	if (
		attribute.type !== 'JSXAttribute' ||
		attribute.name.type !== 'JSXIdentifier'
	) {
		return null;
	}

	return attribute.name.name;
};

const getStaticNumber = (
	attribute: JSXElement['openingElement']['attributes'][number],
): number | null => {
	if (attribute.type !== 'JSXAttribute') {
		return null;
	}

	if (!attribute.value) {
		return null;
	}

	if (attribute.value.type === 'StringLiteral') {
		const parsed = Number(attribute.value.value);
		return Number.isFinite(parsed) ? parsed : null;
	}

	if (attribute.value.type !== 'JSXExpressionContainer') {
		return null;
	}

	const {expression} = attribute.value;
	if (expression.type === 'NumericLiteral') {
		return expression.value;
	}

	if (
		expression.type === 'UnaryExpression' &&
		expression.operator === '-' &&
		expression.argument.type === 'NumericLiteral'
	) {
		return -expression.argument.value;
	}

	if (expression.type === 'Identifier' && expression.name === 'Infinity') {
		return Infinity;
	}

	return null;
};

const readSequenceTiming = (element: JSXElement): SequenceTiming => {
	let from = 0;
	let durationInFrames = Infinity;
	let trimBefore = 0;
	let hasFrom = false;
	let hasDurationInFrames = false;
	let hasTrimBefore = false;

	for (const attribute of element.openingElement.attributes) {
		const name = getAttributeName(attribute);
		if (!name) {
			continue;
		}

		if (
			name !== 'from' &&
			name !== 'durationInFrames' &&
			name !== 'trimBefore'
		) {
			continue;
		}

		const value = getStaticNumber(attribute);
		if (value === null) {
			throw new Error(`Cannot split sequence with dynamic ${name}`);
		}

		if (name === 'from') {
			from = value;
			hasFrom = true;
		}

		if (name === 'durationInFrames') {
			durationInFrames = value;
			hasDurationInFrames = true;
		}

		if (name === 'trimBefore') {
			trimBefore = value;
			hasTrimBefore = true;
		}
	}

	return {
		from,
		durationInFrames,
		trimBefore,
		hasFrom,
		hasDurationInFrames,
		hasTrimBefore,
	};
};

const setNumericAttribute = ({
	element,
	name,
	value,
	omitIfMissing,
}: {
	element: JSXElement;
	name: string;
	value: number | null;
	omitIfMissing: boolean;
}) => {
	const {
		openingElement: {attributes},
	} = element;
	const index = attributes.findIndex(
		(attribute) => getAttributeName(attribute) === name,
	);

	if (value === null || (index === -1 && omitIfMissing)) {
		if (index !== -1) {
			attributes.splice(index, 1);
		}

		return;
	}

	const next = numericAttribute(name, value);
	if (index === -1) {
		attributes.push(next);
	} else {
		attributes[index] = next;
	}
};

const timingAttributeOrder = ['from', 'durationInFrames', 'trimBefore'];

const orderTimingAttributes = (element: JSXElement) => {
	const {
		openingElement: {attributes},
	} = element;
	const timingAttributes = new Map<string, (typeof attributes)[number]>();
	const otherAttributes: typeof attributes = [];
	let firstTimingIndex: number | null = null;

	for (let i = 0; i < attributes.length; i++) {
		const attribute = attributes[i];
		const name = getAttributeName(attribute);
		if (name && timingAttributeOrder.includes(name)) {
			timingAttributes.set(name, attribute);
			firstTimingIndex = firstTimingIndex === null ? i : firstTimingIndex;
		} else {
			otherAttributes.push(attribute);
		}
	}

	if (firstTimingIndex === null) {
		return;
	}

	const orderedTimingAttributes = timingAttributeOrder.flatMap((name) => {
		const attribute = timingAttributes.get(name);
		return attribute ? [attribute] : [];
	});
	const insertionIndex = Math.min(firstTimingIndex, otherAttributes.length);
	attributes.splice(
		0,
		attributes.length,
		...otherAttributes.slice(0, insertionIndex),
		...orderedTimingAttributes,
		...otherAttributes.slice(insertionIndex),
	);
};

const splittableSequenceTags = new Set([
	'AnimatedImage',
	'Arrow',
	'Audio',
	'Callout',
	'CanvasImage',
	'Circle',
	'Ellipse',
	'Gif',
	'Heart',
	'Html5Audio',
	'Html5Video',
	'HtmlInCanvas',
	'Img',
	'OffthreadVideo',
	'Pie',
	'Polygon',
	'Rect',
	'RemotionRiveCanvas',
	'Sequence',
	'Solid',
	'Spark',
	'Star',
	'Starburst',
	'Triangle',
	'Video',
]);

const unsupportedSequenceTags = new Set([
	'Series.Sequence',
	'TransitionSeries.Overlay',
	'TransitionSeries.Sequence',
]);

const jsxMemberNameToString = (
	name: JSXIdentifier | JSXMemberExpression,
): string => {
	if (name.type === 'JSXIdentifier') {
		return name.name;
	}

	return `${jsxMemberNameToString(name.object)}.${name.property.name}`;
};

const jsxNameToString = (
	name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName,
): string => {
	if (name.type === 'JSXNamespacedName') {
		return `${name.namespace.name}:${name.name.name}`;
	}

	return jsxMemberNameToString(name);
};

export const getSplitUnsupportedSequenceTagReason = (
	tagName: string,
): string | null => {
	if (
		tagName === 'Series.Sequence' ||
		tagName === 'TransitionSeries.Sequence' ||
		tagName === 'TransitionSeries.Overlay'
	) {
		return `<${tagName}> cannot be split from source`;
	}

	return null;
};

export const getIsSplittableSequenceTag = (tagName: string): boolean => {
	if (unsupportedSequenceTags.has(tagName)) {
		return false;
	}

	if (tagName.startsWith('Interactive.')) {
		return true;
	}

	return splittableSequenceTags.has(tagName);
};

const getSplittableSequenceTagName = (element: JSXElement): string => {
	return jsxNameToString(element.openingElement.name);
};

const makeFragment = (first: JSXElement, second: JSXElement): JSXFragment => ({
	type: 'JSXFragment',
	openingFragment: {type: 'JSXOpeningFragment'},
	closingFragment: {type: 'JSXClosingFragment'},
	children: [first, second],
});

const insertAfter = (
	parentNode: Node,
	node: JSXElement,
	clone: JSXElement,
): boolean => {
	if (
		namedTypes.JSXElement.check(parentNode) ||
		namedTypes.JSXFragment.check(parentNode)
	) {
		const idx = parentNode.children.indexOf(node);
		if (idx !== -1) {
			parentNode.children.splice(idx + 1, 0, clone);
			return true;
		}
	}

	if (namedTypes.ReturnStatement.check(parentNode)) {
		const parent = parentNode as ReturnStatement;
		if (parent.argument === node) {
			parent.argument = makeFragment(node, clone) as unknown as Expression;
			return true;
		}
	}

	if (namedTypes.ArrowFunctionExpression.check(parentNode)) {
		const parent = parentNode as ArrowFunctionExpression;
		if (parent.body === node) {
			parent.body = makeFragment(
				node,
				clone,
			) as ArrowFunctionExpression['body'];
			return true;
		}
	}

	return false;
};

export const splitJsxSequence = async ({
	input,
	nodePath,
	splitFrame,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	splitFrame: number;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	nodeLabel: string;
	logLine: number;
}> => {
	if (!Number.isInteger(splitFrame)) {
		throw new Error('Split frame must be an integer');
	}

	const ast = parseAst(input);
	const jsxPath = findJsxElementPathForDeletion(ast, nodePath);
	if (!jsxPath) {
		throw new Error(
			'Could not find a JSX sequence at the specified location to split',
		);
	}

	const jsxElement = jsxPath.node as JSXElement;
	const tagName = getSplittableSequenceTagName(jsxElement);
	const unsupportedReason = getSplitUnsupportedSequenceTagReason(tagName);
	if (unsupportedReason) {
		throw new Error(unsupportedReason);
	}

	if (!getIsSplittableSequenceTag(tagName)) {
		throw new Error(
			`<${tagName}> does not support sequence timing props and cannot be split`,
		);
	}

	const timing = readSequenceTiming(jsxElement);
	const finiteEnd =
		timing.durationInFrames === Infinity
			? Infinity
			: timing.from + timing.durationInFrames;

	if (splitFrame <= timing.from) {
		throw new Error('Cannot split at or before the sequence start');
	}

	if (splitFrame >= finiteEnd) {
		throw new Error('Cannot split at or after the sequence end');
	}

	const right = cloneNode(jsxElement, true) as JSXElement;
	const leftDuration = splitFrame - timing.from;
	const rightDuration =
		timing.durationInFrames === Infinity ? Infinity : finiteEnd - splitFrame;
	const rightTrimBefore = timing.trimBefore + leftDuration;

	setNumericAttribute({
		element: jsxElement,
		name: 'durationInFrames',
		value: leftDuration,
		omitIfMissing: false,
	});
	setNumericAttribute({
		element: right,
		name: 'from',
		value: splitFrame,
		omitIfMissing: false,
	});
	setNumericAttribute({
		element: right,
		name: 'durationInFrames',
		value: rightDuration === Infinity ? null : rightDuration,
		omitIfMissing: !timing.hasDurationInFrames,
	});
	setNumericAttribute({
		element: right,
		name: 'trimBefore',
		value: rightTrimBefore === 0 ? null : rightTrimBefore,
		omitIfMissing: !timing.hasTrimBefore && rightTrimBefore === 0,
	});
	orderTimingAttributes(jsxElement);
	orderTimingAttributes(right);

	const {parentPath} = jsxPath;
	if (!parentPath) {
		throw new Error('Cannot split JSX sequence with no parent');
	}

	if (!insertAfter(parentPath.node, jsxElement, right)) {
		jsxPath.replace(makeFragment(jsxElement, right));
	}

	const finalFile = serializeAst(ast);
	const {output, formatted} = await formatFileContent({
		input: finalFile,
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		nodeLabel: getJsxElementTagLabel(jsxElement),
		logLine:
			jsxElement.openingElement.loc?.start.line ??
			jsxElement.loc?.start.line ??
			1,
	};
};

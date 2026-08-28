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
import {
	hasSequenceTimingTraits,
	type SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} from './delete-jsx-node';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {
	parseAst,
	parseAstForReadOnly,
	serializeAst,
} from './sequence-props/parse-ast';

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

const getSplittableSequenceTagName = (element: JSXElement): string => {
	return jsxNameToString(element.openingElement.name);
};

/*
 * `cloneNode` from `@babel/types` reads `process.env` at module scope, which
 * breaks browser bundles. Printing and reparsing yields an equally detached
 * deep copy without the Node-only dependency.
 */
const cloneJsxElement = (element: JSXElement): JSXElement => {
	const printed = recast.print(
		element as Parameters<typeof recast.print>[0],
	).code;
	const file = parseAstForReadOnly(`<>${printed}</>;`);
	const statement = file.program.body[0];
	if (
		statement?.type !== 'ExpressionStatement' ||
		statement.expression.type !== 'JSXFragment'
	) {
		throw new Error('Could not clone the JSX sequence to split');
	}

	const cloned = statement.expression.children.find(
		(child): child is JSXElement => child.type === 'JSXElement',
	);
	if (!cloned) {
		throw new Error('Could not clone the JSX sequence to split');
	}

	return cloned;
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

export const splitJsxSequences = async ({
	input,
	splits,
	splitFrame,
	formatFile,
	prettierConfigOverride,
}: {
	input: string;
	splits: Array<{
		nodePath: SequenceNodePath;
		sequenceKeys: string[];
	}>;
	splitFrame: number;
	formatFile: (input: {
		contents: string;
		prettierConfigOverride: Record<string, unknown> | null;
	}) => Promise<{output: string; formatted: boolean}>;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	nodeLabels: string[];
	logLines: number[];
	nodePathRemappings: SequenceNodePathRemapping[];
}> => {
	if (splits.length === 0) {
		throw new Error('No JSX sequences were specified for splitting');
	}

	if (!Number.isInteger(splitFrame)) {
		throw new Error('Split frame must be an integer');
	}

	const ast = parseAst(input);
	const capturedNodePaths = captureJsxNodePaths(ast);
	const pathsToSplit = splits.map(({nodePath, sequenceKeys}) => {
		const jsxPath = findJsxElementPathForDeletion(ast, nodePath);
		if (!jsxPath) {
			throw new Error(
				'Could not find a JSX sequence at the specified location to split',
			);
		}

		const jsxElement = jsxPath.node as JSXElement;
		const tagName = getSplittableSequenceTagName(jsxElement);
		if (!hasSequenceTimingTraits(sequenceKeys)) {
			throw new Error(`<${tagName}> cannot be split`);
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

		return {jsxElement, jsxPath, timing, finiteEnd};
	});

	for (const {jsxElement, jsxPath, timing, finiteEnd} of pathsToSplit) {
		const right = cloneJsxElement(jsxElement);
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
	}

	const finalFile = serializeAst(ast);
	const {output, formatted} = await formatFile({
		contents: finalFile,
		prettierConfigOverride: prettierConfigOverride ?? null,
	});
	const {nodePathRemappings} = getNodePathRemappings({
		ast,
		captured: capturedNodePaths,
		output,
	});

	return {
		output,
		formatted,
		nodeLabels: pathsToSplit.map(({jsxElement}) =>
			getJsxElementTagLabel(jsxElement),
		),
		logLines: pathsToSplit.map(
			({jsxElement}) =>
				jsxElement.openingElement.loc?.start.line ??
				jsxElement.loc?.start.line ??
				1,
		),
		nodePathRemappings,
	};
};

export const splitJsxSequence = async ({
	input,
	nodePath,
	sequenceKeys,
	splitFrame,
	formatFile,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	sequenceKeys: string[];
	splitFrame: number;
	formatFile: (input: {
		contents: string;
		prettierConfigOverride: Record<string, unknown> | null;
	}) => Promise<{output: string; formatted: boolean}>;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	nodeLabel: string;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
}> => {
	const {output, formatted, nodeLabels, logLines, nodePathRemappings} =
		await splitJsxSequences({
			input,
			splits: [{nodePath, sequenceKeys}],
			splitFrame,
			formatFile,
			prettierConfigOverride,
		});

	return {
		output,
		formatted,
		nodeLabel: nodeLabels[0],
		logLine: logLines[0],
		nodePathRemappings,
	};
};

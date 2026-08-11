import type {Expression, ObjectExpression, ObjectProperty} from '@babel/types';
import type {CaptionPatch} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import {findJsxElementNodeAtNodePath} from './sequence-props';
import {parseAst} from './sequence-props/parse-ast';

const captionKeys = [
	'text',
	'startMs',
	'endMs',
	'timestampMs',
	'confidence',
] as const;

type CaptionKey = (typeof captionKeys)[number];
type StaticCaption = CaptionPatch['before'];

const getPropertyKey = (property: ObjectProperty): string | null => {
	if (property.key.type === 'Identifier') {
		return property.key.name;
	}

	if (property.key.type === 'StringLiteral') {
		return property.key.value;
	}

	return null;
};

const getStaticValue = (value: Expression): string | number | null => {
	if (value.type === 'StringLiteral' || value.type === 'NumericLiteral') {
		return value.value;
	}

	if (value.type === 'NullLiteral') {
		return null;
	}

	throw new Error('Captions must use static literal values to be edited');
};

const getStaticCaption = (expression: ObjectExpression): StaticCaption => {
	const values = new Map<string, string | number | null>();
	for (const property of expression.properties) {
		if (property.type !== 'ObjectProperty' || property.computed) {
			throw new Error(
				'Captions must use static object properties to be edited',
			);
		}

		const key = getPropertyKey(property);
		if (key !== null && captionKeys.includes(key as CaptionKey)) {
			values.set(key, getStaticValue(property.value as Expression));
		}
	}

	const text = values.get('text');
	const startMs = values.get('startMs');
	const endMs = values.get('endMs');
	const timestampMs = values.get('timestampMs');
	const confidence = values.get('confidence');
	if (
		typeof text !== 'string' ||
		typeof startMs !== 'number' ||
		typeof endMs !== 'number' ||
		(timestampMs !== null && typeof timestampMs !== 'number') ||
		(confidence !== null && typeof confidence !== 'number')
	) {
		throw new Error(
			'Captions must have the standard static caption shape to edit',
		);
	}

	return {text, startMs, endMs, timestampMs, confidence};
};

const isCaptionKey = (key: string): key is CaptionKey =>
	captionKeys.includes(key as CaptionKey);

const getReplacementValue = ({
	value,
	previous,
}: {
	value: string | number | null;
	previous: Expression;
}): string => {
	if (value === null || typeof value === 'number') {
		return String(value);
	}

	if (
		previous.type === 'StringLiteral' &&
		typeof previous.extra?.raw === 'string' &&
		previous.extra.raw.startsWith("'")
	) {
		return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
	}

	return JSON.stringify(value);
};

const getSourceValueRange = ({
	input,
	property,
	key,
}: {
	input: string;
	property: ObjectProperty;
	key: string;
}): {start: number; end: number} => {
	const line = property.loc?.start.line;
	if (line === null || line === undefined) {
		throw new Error(`Could not locate caption ${key} in the source file`);
	}

	const lines = input.split('\n');
	const lineStart = lines
		.slice(0, line - 1)
		.reduce((length, current) => length + current.length + 1, 0);
	const sourceLine = lines[line - 1];
	if (sourceLine === undefined) {
		throw new Error(`Could not locate caption ${key} in the source file`);
	}

	const keyStart = sourceLine.indexOf(key);
	const valueStart = sourceLine.indexOf(':', keyStart) + 1;
	const rawValue: string =
		property.value.type === 'StringLiteral' &&
		typeof property.value.extra?.raw === 'string'
			? property.value.extra.raw
			: property.value.type === 'StringLiteral'
				? JSON.stringify(property.value.value)
				: String(getStaticValue(property.value as Expression));
	const valueOffset = sourceLine.indexOf(rawValue, valueStart);
	if (keyStart === -1 || valueOffset === -1) {
		throw new Error(`Could not locate caption ${key} in the source file`);
	}

	return {
		start: lineStart + valueOffset,
		end: lineStart + valueOffset + rawValue.length,
	};
};

const updateCaption = ({
	input,
	caption,
	patch,
}: {
	input: string;
	caption: ObjectExpression;
	patch: CaptionPatch;
}): {changedFields: string[]; replacements: SourceReplacement[]} => {
	const current = getStaticCaption(caption);
	if (!captionKeys.every((key) => current[key] === patch.before[key])) {
		throw new Error(
			`Caption ${patch.index} changed in the source file before this edit could be saved`,
		);
	}

	const changedKeys = Object.keys(patch.changes);
	if (changedKeys.length === 0 || !changedKeys.every(isCaptionKey)) {
		throw new Error('Caption patches must change at least one caption field');
	}

	const replacements: SourceReplacement[] = [];
	for (const key of changedKeys) {
		const value = patch.changes[key];
		if (
			(key === 'text' && typeof value !== 'string') ||
			((key === 'startMs' || key === 'endMs') &&
				(typeof value !== 'number' || !Number.isFinite(value))) ||
			((key === 'timestampMs' || key === 'confidence') &&
				value !== null &&
				(typeof value !== 'number' || !Number.isFinite(value)))
		) {
			throw new Error(`Caption ${key} has an invalid value`);
		}

		const property = caption.properties.find((candidate) => {
			return (
				candidate.type === 'ObjectProperty' &&
				!candidate.computed &&
				getPropertyKey(candidate) === key
			);
		});
		if (!property || property.type !== 'ObjectProperty') {
			throw new Error(`Caption ${patch.index} is missing ${key}`);
		}

		const {start, end} = getSourceValueRange({input, property, key});
		replacements.push({
			start,
			end,
			value: getReplacementValue({
				value: value as string | number | null,
				previous: property.value as Expression,
			}),
		});
	}

	return {changedFields: changedKeys, replacements};
};

type SourceReplacement = {
	start: number;
	end: number;
	value: string;
};

export const updateInlineCaptionPatches = ({
	input,
	nodePath,
	patches,
}: {
	input: string;
	nodePath: SequenceNodePath;
	patches: CaptionPatch[];
}): {output: string; logLine: number; changedFields: string[][]} => {
	if (patches.length === 0) {
		throw new Error('Expected at least one caption patch');
	}

	const ast = parseAst(input);
	const jsxElement = findJsxElementNodeAtNodePath(ast, nodePath);
	if (!jsxElement) {
		throw new Error(
			'Could not find a JSX element at the specified line to update',
		);
	}

	const captionsAttribute = jsxElement.openingElement.attributes?.find(
		(attribute) =>
			attribute.type === 'JSXAttribute' &&
			attribute.name.type === 'JSXIdentifier' &&
			attribute.name.name === 'captions',
	);
	if (
		!captionsAttribute ||
		captionsAttribute.type !== 'JSXAttribute' ||
		captionsAttribute.value?.type !== 'JSXExpressionContainer' ||
		captionsAttribute.value.expression.type !== 'ArrayExpression'
	) {
		throw new Error('Captions must be an inline JSX array to edit them');
	}

	const captions = captionsAttribute.value.expression.elements;
	const changedFields: string[][] = [];
	const replacements: SourceReplacement[] = [];
	for (const patch of patches) {
		if (!Number.isInteger(patch.index) || patch.index < 0) {
			throw new Error('Caption patch index must be a non-negative integer');
		}

		const caption = captions[patch.index];
		if (!caption || caption.type !== 'ObjectExpression') {
			throw new Error(`Could not find inline caption ${patch.index}`);
		}

		const result = updateCaption({input, caption, patch});
		changedFields.push(result.changedFields);
		replacements.push(...result.replacements);
	}

	const output = replacements
		.sort((a, b) => b.start - a.start)
		.reduce(
			(current, replacement) =>
				current.slice(0, replacement.start) +
				replacement.value +
				current.slice(replacement.end),
			input,
		);

	return {
		output,
		logLine: jsxElement.openingElement.loc?.start.line ?? 1,
		changedFields,
	};
};

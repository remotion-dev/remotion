import type {Expression, ObjectProperty} from '@babel/types';
import type {CaptionPatch} from '@remotion/studio-shared';
import {parseAst} from './parse-ast';

const captionKeys = [
	'text',
	'startMs',
	'endMs',
	'timestampMs',
	'confidence',
] as const;

type CaptionKey = (typeof captionKeys)[number];
type StaticCaption = CaptionPatch['before'];

type SourceReplacement = {
	start: number;
	end: number;
	value: string;
};

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

const getStaticCaption = (expression: {
	properties: readonly unknown[];
}): StaticCaption => {
	const values = new Map<string, string | number | null>();
	for (const property of expression.properties) {
		if (
			typeof property !== 'object' ||
			property === null ||
			!('type' in property) ||
			property.type !== 'ObjectProperty' ||
			!('computed' in property) ||
			property.computed
		) {
			throw new Error(
				'Captions must use static object properties to be edited',
			);
		}

		const objectProperty = property as unknown as ObjectProperty;
		const key = getPropertyKey(objectProperty);
		if (key !== null && captionKeys.includes(key as CaptionKey)) {
			values.set(key, getStaticValue(objectProperty.value as Expression));
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
	if (line === undefined) {
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

const unwrapTypeExpression = (expression: Expression): Expression => {
	if (
		expression.type === 'TSAsExpression' ||
		expression.type === 'TSSatisfiesExpression'
	) {
		return unwrapTypeExpression(expression.expression as Expression);
	}

	return expression;
};

export const updateImportedCaptionPatches = ({
	input,
	exportName,
	patches,
}: {
	input: string;
	exportName: string;
	patches: CaptionPatch[];
}): {output: string; logLine: number; changedFields: string[][]} => {
	if (patches.length === 0) {
		throw new Error('Expected at least one caption patch');
	}

	const ast = parseAst(input);
	const declaration = ast.program.body.find((statement) => {
		if (
			statement.type !== 'ExportNamedDeclaration' ||
			statement.declaration?.type !== 'VariableDeclaration' ||
			statement.declaration.kind !== 'const'
		) {
			return false;
		}

		return statement.declaration.declarations.some(
			(declarationVariable) =>
				declarationVariable.id.type === 'Identifier' &&
				declarationVariable.id.name === exportName,
		);
	});
	if (
		!declaration ||
		declaration.type !== 'ExportNamedDeclaration' ||
		declaration.declaration?.type !== 'VariableDeclaration' ||
		declaration.declaration.kind !== 'const'
	) {
		throw new Error(
			`Could not find exported caption declaration "${exportName}"`,
		);
	}

	const variable = declaration.declaration.declarations.find(
		(candidate) =>
			candidate.id.type === 'Identifier' && candidate.id.name === exportName,
	);
	if (!variable?.init) {
		throw new Error(
			`Caption declaration "${exportName}" must have an initializer`,
		);
	}

	const captions = unwrapTypeExpression(variable.init as Expression);
	if (captions.type !== 'ArrayExpression') {
		throw new Error(
			`Caption declaration "${exportName}" must be a static array`,
		);
	}

	const replacements: SourceReplacement[] = [];
	const changedFields: string[][] = [];
	for (const patch of patches) {
		if (!Number.isInteger(patch.index) || patch.index < 0) {
			throw new Error('Caption patch index must be a non-negative integer');
		}

		const caption = captions.elements[patch.index];
		if (!caption || caption.type !== 'ObjectExpression') {
			throw new Error(`Could not find caption ${patch.index}`);
		}

		const current = getStaticCaption(caption);
		if (!captionKeys.every((key) => current[key] === patch.before[key])) {
			throw new Error(
				`Caption ${patch.index} changed in the source file before this edit could be saved`,
			);
		}

		const keys = Object.keys(patch.changes);
		if (
			keys.length === 0 ||
			!keys.every((key) => captionKeys.includes(key as CaptionKey))
		) {
			throw new Error('Caption patches must change at least one caption field');
		}

		for (const key of keys as CaptionKey[]) {
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

			const property = caption.properties.find(
				(candidate) =>
					candidate.type === 'ObjectProperty' &&
					!candidate.computed &&
					getPropertyKey(candidate) === key,
			);
			if (!property || property.type !== 'ObjectProperty') {
				throw new Error(`Caption ${patch.index} is missing ${key}`);
			}

			const range = getSourceValueRange({input, property, key});
			replacements.push({
				...range,
				value: getReplacementValue({
					value: value as string | number | null,
					previous: property.value as Expression,
				}),
			});
		}

		changedFields.push(keys);
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
		logLine: variable.loc?.start.line ?? declaration.loc?.start.line ?? 1,
		changedFields,
	};
};

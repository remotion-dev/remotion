import type {
	JSXAttribute,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
	JSXSpreadAttribute,
	StringLiteral,
} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath, InteractivitySchema} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {findJsxElementAtNodePath} from '../../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from '../format-file-content';
import {parseAst, serializeAst} from '../parse-ast';
import {
	parseValueExpression,
	parseValueExpressionFromSource,
	updateNestedProp,
} from '../update-nested-prop';

const b = recast.types.builders;

export type SequencePropUpdate = {
	key: string;
	value: unknown;
	valueExpression: string | null;
	defaultValue: unknown | null;
};

export type RemovedProp = {
	key: string;
	valueString: string;
};

export type SequencePropsNodeUpdate = {
	nodePath: SequenceNodePath;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
};

export type SequencePropsNodeUpdateResult = {
	oldValueStrings: string[];
	logLine: number;
	removedProps: RemovedProp[];
};

type PrettierConfigOverride = Record<string, unknown> | null;

type UpdateMultipleSequencePropsResult = {
	output: string;
	formatted: boolean;
	results: SequencePropsNodeUpdateResult[];
};

type UpdateSequencePropsResult = {
	output: string;
	oldValueStrings: string[];
	formatted: boolean;
	logLine: number;
	removedProps: RemovedProp[];
};

const removeVariantKey = ({
	node,
	variantKey,
}: {
	node: JSXOpeningElementLike;
	variantKey: string;
}) => {
	const dotIndex = variantKey.indexOf('.');
	if (dotIndex === -1) {
		const idx = node.attributes?.findIndex(
			(a) =>
				a.type === 'JSXAttribute' &&
				a.name.type === 'JSXIdentifier' &&
				a.name.name === variantKey,
		);
		if (idx !== undefined && idx !== -1 && node.attributes) {
			node.attributes.splice(idx, 1);
		}

		return;
	}

	updateNestedProp({
		node,
		parentKey: variantKey.slice(0, dotIndex),
		childKey: variantKey.slice(dotIndex + 1),
		value: undefined,
		valueExpression: null,
		defaultValue: null,
		isDefault: true,
	});
};

const snapshotTopLevelAttrs = (
	node: JSXOpeningElementLike,
): Map<string, string> => {
	const result = new Map<string, string>();
	for (const a of node.attributes ?? []) {
		if (a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier') {
			const {name} = a.name;
			const printed = recast
				.print(a)
				.code.replace(/\s+/g, ' ')
				.replace(/,(\s*[}\]])/g, '$1')
				.trim();

			const prefix = `${name}=`;
			let valueOnly = printed.startsWith(prefix)
				? printed.slice(prefix.length)
				: printed;
			if (valueOnly.startsWith('{') && valueOnly.endsWith('}')) {
				valueOnly = valueOnly.slice(1, -1).trim();
			}

			result.set(name, valueOnly);
		}
	}

	return result;
};

type JSXOpeningElementLike = NonNullable<
	ReturnType<typeof findJsxElementAtNodePath>
>;

const updateSequencePropsNode = ({
	node,
	updates,
	schema,
}: {
	node: JSXOpeningElementLike;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
}): {
	oldValueStrings: string[];
	logLine: number;
	removedProps: RemovedProp[];
} => {
	const logLine = node.loc?.start.line ?? 1;

	const oldValueStrings: string[] = [];
	const initialAttrs = snapshotTopLevelAttrs(node);
	const updatedTopLevelKeys = new Set(
		updates.map(({key}) => {
			const dot = key.indexOf('.');
			return dot === -1 ? key : key.slice(0, dot);
		}),
	);

	for (const {key, value, valueExpression, defaultValue} of updates) {
		let oldValueString = '';

		const isDefault =
			defaultValue !== null &&
			JSON.stringify(value) === JSON.stringify(defaultValue);

		const dotIndex = key.indexOf('.');
		const isNested = dotIndex !== -1;
		const parentKey = isNested ? key.slice(0, dotIndex) : key;
		const childKey = isNested ? key.slice(dotIndex + 1) : '';

		if (isNested) {
			oldValueString = updateNestedProp({
				node,
				parentKey,
				childKey,
				value,
				valueExpression,
				defaultValue,
				isDefault,
			});
		} else {
			const attrIndex = node.attributes?.findIndex((a) => {
				if (a.type === 'JSXSpreadAttribute') {
					return false;
				}

				if (a.name.type === 'JSXNamespacedName') {
					return false;
				}

				return a.name.name === key;
			});

			const attr =
				attrIndex !== undefined && attrIndex !== -1
					? node.attributes?.[attrIndex]
					: undefined;

			if (attr && attr.type !== 'JSXSpreadAttribute' && attr.value) {
				const printed = recast.print(attr.value).code;
				// Strip JSX expression container braces, e.g. "{30}" -> "30"
				oldValueString =
					printed.startsWith('{') && printed.endsWith('}')
						? printed.slice(1, -1)
						: printed;
			} else if (attr && attr.type !== 'JSXSpreadAttribute' && !attr.value) {
				// JSX shorthand like `loop` (no value) is implicitly `true`
				oldValueString = 'true';
			} else if (!attr && defaultValue !== null) {
				oldValueString = JSON.stringify(defaultValue);
			}

			if (isDefault) {
				if (attr && attr.type !== 'JSXSpreadAttribute' && node.attributes) {
					node.attributes.splice(attrIndex!, 1);
				}
			} else {
				const parsed =
					valueExpression === null
						? parseValueExpression(value)
						: parseValueExpressionFromSource(valueExpression);

				const newValue =
					value === true ? null : b.jsxExpressionContainer(parsed);

				if (!attr || attr.type === 'JSXSpreadAttribute') {
					const newAttr = b.jsxAttribute(b.jsxIdentifier(key), newValue);

					if (!node.attributes) {
						node.attributes = [];
					}

					node.attributes.push(newAttr as JSXAttribute | JSXSpreadAttribute);
				} else {
					attr.value = newValue as
						| JSXElement
						| JSXExpressionContainer
						| JSXFragment
						| StringLiteral
						| null
						| undefined;
				}
			}
		}

		oldValueStrings.push(oldValueString);

		if (!isNested) {
			const fieldSchema = schema[key];
			if (fieldSchema && fieldSchema.type === 'enum') {
				const propsToDelete = NoReactInternals.findPropsToDelete({
					schema,
					key,
					value,
				});
				for (const propToDelete of propsToDelete) {
					removeVariantKey({node, variantKey: propToDelete});
				}
			}
		}
	}

	const finalAttrNames = new Set<string>();
	for (const a of node.attributes ?? []) {
		if (a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier') {
			finalAttrNames.add(a.name.name);
		}
	}

	const removedProps: RemovedProp[] = [];
	for (const [name, valueString] of initialAttrs) {
		if (finalAttrNames.has(name) || updatedTopLevelKeys.has(name)) {
			continue;
		}

		removedProps.push({key: name, valueString});
	}

	return {
		oldValueStrings,
		logLine,
		removedProps,
	};
};

export const updateSequencePropsAst = ({
	input,
	nodePath,
	updates,
	schema,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
}): {
	serialized: string;
	oldValueStrings: string[];
	logLine: number;
	removedProps: RemovedProp[];
} => {
	const ast = parseAst(input);

	const node = findJsxElementAtNodePath(ast, nodePath);
	if (!node) {
		throw new Error(
			'Could not find a JSX element at the specified line to update',
		);
	}

	const {oldValueStrings, logLine, removedProps} = updateSequencePropsNode({
		node,
		updates,
		schema,
	});

	return {
		serialized: serializeAst(ast),
		oldValueStrings,
		logLine,
		removedProps,
	};
};

export const updateMultipleSequenceProps = async ({
	input,
	changes,
	prettierConfigOverride,
}: {
	input: string;
	changes: SequencePropsNodeUpdate[];
	prettierConfigOverride: PrettierConfigOverride;
}): Promise<UpdateMultipleSequencePropsResult> => {
	const ast = parseAst(input);
	const results = changes.map(({nodePath, updates, schema}) => {
		const node = findJsxElementAtNodePath(ast, nodePath);
		if (!node) {
			throw new Error(
				'Could not find a JSX element at the specified line to update',
			);
		}

		return updateSequencePropsNode({node, updates, schema});
	});

	const {output, formatted} = await formatFileContent({
		input: serializeAst(ast),
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		results,
	};
};

export const updateSequenceProps = async ({
	input,
	nodePath,
	updates,
	schema,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
	prettierConfigOverride: PrettierConfigOverride;
}): Promise<UpdateSequencePropsResult> => {
	const {serialized, oldValueStrings, logLine, removedProps} =
		updateSequencePropsAst({
			input,
			nodePath,
			updates,
			schema,
		});

	const {output, formatted} = await formatFileContent({
		input: serialized,
		prettierConfigOverride,
	});

	return {
		output,
		oldValueStrings,
		formatted,
		logLine,
		removedProps,
	};
};

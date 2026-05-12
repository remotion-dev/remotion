import type {
	JSXAttribute,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
	JSXSpreadAttribute,
	StringLiteral,
} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import type {SequenceSchema} from 'remotion';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';
import {parseValueExpression, updateNestedProp} from './update-nested-prop';

const b = recast.types.builders;

export type SequencePropUpdate = {
	key: string;
	value: unknown;
	defaultValue: unknown | null;
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
		defaultValue: null,
		isDefault: true,
	});
};

type JSXOpeningElementLike = NonNullable<
	ReturnType<typeof findJsxElementAtNodePath>
>;

export const updateSequencePropsAst = ({
	input,
	nodePath,
	updates,
	schema,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequencePropUpdate[];
	schema?: SequenceSchema;
}): {
	serialized: string;
	oldValueStrings: string[];
	logLine: number;
} => {
	const ast = parseAst(input);

	const node = findJsxElementAtNodePath(ast, nodePath);
	if (!node) {
		throw new Error(
			'Could not find a JSX element at the specified line to update',
		);
	}

	const logLine = node.loc?.start.line ?? 1;

	const oldValueStrings: string[] = [];

	for (const {key, value, defaultValue} of updates) {
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
				const parsed = parseValueExpression(value);

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

		if (schema && !isNested) {
			const fieldSchema = schema[key];
			if (fieldSchema && fieldSchema.type === 'enum') {
				let oldRawValue: unknown;
				try {
					oldRawValue = JSON.parse(oldValueString);
				} catch {
					oldRawValue = oldValueString;
				}

				if (oldRawValue !== value) {
					const oldVariant =
						typeof oldRawValue === 'string'
							? fieldSchema.variants[oldRawValue]
							: undefined;
					const newVariant =
						typeof value === 'string' ? fieldSchema.variants[value] : undefined;

					if (oldVariant) {
						const newKeys = new Set(newVariant ? Object.keys(newVariant) : []);
						for (const variantKey of Object.keys(oldVariant)) {
							if (newKeys.has(variantKey)) {
								continue;
							}

							removeVariantKey({node, variantKey});
						}
					}
				}
			}
		}
	}

	return {
		serialized: serializeAst(ast),
		oldValueStrings,
		logLine,
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
	schema: SequenceSchema;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	oldValueStrings: string[];
	formatted: boolean;
	logLine: number;
}> => {
	const {serialized, oldValueStrings, logLine} = updateSequencePropsAst({
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
	};
};

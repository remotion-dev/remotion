import type {
	JSXAttribute,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
	JSXSpreadAttribute,
	StringLiteral,
} from '@babel/types';
import type {SequenceNodePath} from '@remotion/studio-shared';
import * as recast from 'recast';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {parseAst, serializeAst} from './parse-ast';
import {parseValueExpression, updateNestedProp} from './update-nested-prop';

const b = recast.types.builders;

export const updateSequenceProps = async ({
	input,
	nodePath,
	key,
	value,
	defaultValue,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	key: string;
	value: unknown;
	defaultValue: unknown | null;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	oldValueString: string;
	formatted: boolean;
}> => {
	const ast = parseAst(input);
	let oldValueString = '';

	const isDefault =
		defaultValue !== null &&
		JSON.stringify(value) === JSON.stringify(defaultValue);

	const dotIndex = key.indexOf('.');
	const isNested = dotIndex !== -1;
	const parentKey = isNested ? key.slice(0, dotIndex) : key;
	const childKey = isNested ? key.slice(dotIndex + 1) : '';

	const node = findJsxElementAtNodePath(ast, nodePath);
	if (!node) {
		throw new Error(
			'Could not find a JSX element at the specified line to update',
		);
	}

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

			const newValue = value === true ? null : b.jsxExpressionContainer(parsed);

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

	const finalFile = serializeAst(ast);

	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	type PrettierType = typeof import('prettier');
	let prettier: PrettierType | null = null;

	try {
		prettier = await import('prettier');
	} catch {
		return {
			output: finalFile,
			oldValueString,
			formatted: false,
		};
	}

	const {format, resolveConfig, resolveConfigFile} = prettier as PrettierType;

	let prettierConfig: Record<string, unknown> | null;

	if (prettierConfigOverride !== undefined) {
		prettierConfig = prettierConfigOverride;
	} else {
		const configFilePath = await resolveConfigFile();
		if (!configFilePath) {
			return {
				output: finalFile,
				oldValueString,
				formatted: false,
			};
		}

		prettierConfig = await resolveConfig(configFilePath);
	}

	if (!prettierConfig) {
		return {
			output: finalFile,
			oldValueString,
			formatted: false,
		};
	}

	const prettified = await format(finalFile, {
		...prettierConfig,
		filepath: 'test.tsx',
		plugins: [],
		endOfLine: 'lf',
	});

	return {
		output: prettified,
		oldValueString,
		formatted: true,
	};
};

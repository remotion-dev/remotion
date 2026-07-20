import type {
	JSXAttribute,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
	JSXSpreadAttribute,
	StringLiteral,
	Expression,
	File,
	Statement,
} from '@babel/types';
import type {GoogleFontSourceEdit} from '@remotion/studio-shared';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import type {
	InteractivitySchema,
	SequenceNodePath,
	VideoConfigValues,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	parseVideoConfigNumericExpression,
	updateVideoConfigNumericExpression,
} from '../../helpers/video-config-numeric-expression';
import {
	getVideoConfigIdentifierValues,
	type VideoConfigIdentifierValues,
} from '../../helpers/video-config-values';
import {
	findJsxElementNodeAtNodePath,
	getStaticJsxChildrenAttribute,
	getStaticJsxTextContent,
	hasJsxChildrenAttribute,
} from '../../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from '../format-file-content';
import {parseAst, serializeAst} from '../parse-ast';
import {parseValueExpression, updateNestedProp} from '../update-nested-prop';

const b = recast.types.builders;

export type SequencePropUpdate = {
	key: string;
	value: unknown;
	defaultValue: unknown | null;
	googleFont?: GoogleFontSourceEdit | null;
};

export type RemovedProp = {
	key: string;
	valueString: string;
};

export type SequencePropsNodeUpdate = {
	nodePath: SequenceNodePath;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
	videoConfigValues: VideoConfigValues | null;
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
		defaultValue: null,
		isDefault: true,
		createValueExpression: null,
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

type JSXElementLike = NonNullable<
	ReturnType<typeof findJsxElementNodeAtNodePath>
>;
type JSXOpeningElementLike = JSXElementLike['openingElement'];

const escapeJsxText = (value: string): string => {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/{/g, '&#123;')
		.replace(/}/g, '&#125;');
};

const findChildrenAttribute = (
	node: JSXOpeningElementLike,
): JSXAttribute | undefined => {
	return node.attributes?.find((attr) => {
		return (
			attr.type === 'JSXAttribute' &&
			attr.name.type === 'JSXIdentifier' &&
			attr.name.name === 'children'
		);
	}) as JSXAttribute | undefined;
};

const updateJsxTextContent = ({
	jsxElement,
	value,
}: {
	jsxElement: JSXElementLike;
	value: unknown;
}): string => {
	const nextValue = String(value ?? '');
	const staticChildrenAttribute = getStaticJsxChildrenAttribute(
		jsxElement.openingElement,
	);
	if (staticChildrenAttribute) {
		const childrenAttribute = findChildrenAttribute(jsxElement.openingElement);
		if (!childrenAttribute) {
			throw new Error('Expected static children attribute to exist');
		}

		childrenAttribute.value = b.stringLiteral(nextValue) as StringLiteral;
		return staticChildrenAttribute.value;
	}

	if (hasJsxChildrenAttribute(jsxElement.openingElement)) {
		throw new Error(
			'Cannot update text content because the children attribute is not static text',
		);
	}

	const staticTextContent = getStaticJsxTextContent(jsxElement);
	if (!staticTextContent) {
		throw new Error(
			'Cannot update text content because JSX children are not static text',
		);
	}

	const canRepresentAsJsxText =
		staticTextContent.kind === 'jsx-text' &&
		!nextValue.includes('\n') &&
		nextValue.trim() === nextValue;
	if (canRepresentAsJsxText) {
		jsxElement.children = [
			b.jsxText(escapeJsxText(nextValue)),
		] as unknown as JSXElementLike['children'];
	} else {
		jsxElement.children = [
			b.jsxExpressionContainer(b.stringLiteral(nextValue)),
		] as unknown as JSXElementLike['children'];
	}

	return staticTextContent.value;
};

const collectTopLevelIdentifierNames = (ast: File): Set<string> => {
	const names = new Set<string>();
	recast.types.visit(ast, {
		visitIdentifier(path) {
			names.add(path.node.name);
			this.traverse(path);
		},
	});

	return names;
};

const toSafeIdentifier = (value: string) => {
	const sanitized = value.replace(/[^a-zA-Z0-9_$]/g, '');
	if (!sanitized) {
		return 'loadGoogleFont';
	}

	return /^[a-zA-Z_$]/.test(sanitized) ? sanitized : `_${sanitized}`;
};

const getSafeLoadFontIdentifier = ({
	font,
	usedNames,
}: {
	font: GoogleFontSourceEdit;
	usedNames: Set<string>;
}) => {
	const baseName = toSafeIdentifier(`load${font.importName}`);
	if (!usedNames.has(baseName)) {
		usedNames.add(baseName);
		return baseName;
	}

	let index = 2;
	while (usedNames.has(`${baseName}${index}`)) {
		index++;
	}

	const name = `${baseName}${index}`;
	usedNames.add(name);
	return name;
};

const getImportedLoadFontIdentifier = ({
	ast,
	font,
}: {
	ast: File;
	font: GoogleFontSourceEdit;
}): string | null => {
	const moduleName = `@remotion/google-fonts/${font.importName}`;
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.source.value !== moduleName
		) {
			continue;
		}

		for (const specifier of statement.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
				specifier.imported.type === 'Identifier' &&
				specifier.imported.name === 'loadFont'
			) {
				return specifier.local?.name ?? 'loadFont';
			}
		}
	}

	return null;
};

const getInsertIndexAfterImportsOrDirectives = (ast: File) => {
	const lastImportIndex = ast.program.body.reduce(
		(lastIndex, statement, index) => {
			return statement.type === 'ImportDeclaration' ? index : lastIndex;
		},
		-1,
	);
	if (lastImportIndex !== -1) {
		return lastImportIndex + 1;
	}

	return ast.program.body.findIndex((statement) => {
		return !(
			statement.type === 'ExpressionStatement' &&
			'directive' in statement &&
			statement.directive
		);
	});
};

const insertAfterImportsOrDirectives = (ast: File, statement: Statement) => {
	const insertIndex = getInsertIndexAfterImportsOrDirectives(ast);
	ast.program.body.splice(
		insertIndex === -1 ? ast.program.body.length : insertIndex,
		0,
		statement,
	);
};

const ensureLoadFontImport = ({
	ast,
	font,
	usedNames,
}: {
	ast: File;
	font: GoogleFontSourceEdit;
	usedNames: Set<string>;
}) => {
	const existing = getImportedLoadFontIdentifier({ast, font});
	if (existing) {
		return existing;
	}

	const moduleName = `@remotion/google-fonts/${font.importName}`;
	const localName = getSafeLoadFontIdentifier({font, usedNames});
	const specifier = b.importSpecifier(
		b.identifier('loadFont'),
		b.identifier(localName),
	);

	for (const statement of ast.program.body) {
		if (
			statement.type === 'ImportDeclaration' &&
			statement.source.value === moduleName &&
			!statement.specifiers?.some(
				(existingSpecifier) =>
					existingSpecifier.type === 'ImportNamespaceSpecifier',
			)
		) {
			statement.specifiers = [
				...(statement.specifiers ?? []),
				specifier as never,
			];
			return localName;
		}
	}

	const declaration = b.importDeclaration(
		[specifier as never],
		b.stringLiteral(moduleName),
	);
	insertAfterImportsOrDirectives(ast, declaration as Statement);
	return localName;
};

const getStringArrayObjectProperty = ({
	node,
	key,
}: {
	node: Expression;
	key: string;
}): string[] | null => {
	if (node.type !== 'ObjectExpression') {
		return null;
	}

	const property = node.properties.find((prop) => {
		return (
			prop.type === 'ObjectProperty' &&
			prop.key.type === 'Identifier' &&
			prop.key.name === key
		);
	});
	if (!property || property.type !== 'ObjectProperty') {
		return null;
	}

	if (property.value.type !== 'ArrayExpression') {
		return null;
	}

	const values: string[] = [];
	for (const element of property.value.elements) {
		if (!element || element.type !== 'StringLiteral') {
			return null;
		}

		values.push(element.value);
	}

	return values;
};

const arraysEqual = (a: readonly string[], bValues: readonly string[]) => {
	return (
		a.length === bValues.length &&
		a.every((value, index) => value === bValues[index])
	);
};

const isMatchingLoadFontCall = ({
	statement,
	localName,
	font,
}: {
	statement: Statement;
	localName: string;
	font: GoogleFontSourceEdit;
}) => {
	if (
		statement.type !== 'ExpressionStatement' ||
		statement.expression.type !== 'CallExpression' ||
		statement.expression.callee.type !== 'Identifier' ||
		statement.expression.callee.name !== localName
	) {
		return false;
	}

	const [style, options] = statement.expression.arguments;
	if (style?.type !== 'StringLiteral' || style.value !== font.style) {
		return false;
	}

	if (!options || options.type !== 'ObjectExpression') {
		return false;
	}

	const weights = getStringArrayObjectProperty({node: options, key: 'weights'});
	const subsets = getStringArrayObjectProperty({node: options, key: 'subsets'});

	return (
		weights !== null &&
		subsets !== null &&
		arraysEqual(weights, font.weights) &&
		arraysEqual(subsets, font.subsets)
	);
};

const hasTopLevelLoadFontCall = ({
	ast,
	localName,
	font,
}: {
	ast: File;
	localName: string;
	font: GoogleFontSourceEdit;
}) => {
	return ast.program.body.some((statement) => {
		return isMatchingLoadFontCall({statement, localName, font});
	});
};

const getGoogleFontImportName = (moduleName: string) => {
	const prefix = '@remotion/google-fonts/';
	return moduleName.startsWith(prefix) ? moduleName.slice(prefix.length) : null;
};

const normalizeFontFamilyName = (fontFamily: string) => {
	return fontFamily.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const getPrimaryFontFamilyName = (fontFamily: string) => {
	const trimmed = fontFamily.trim();
	if (!trimmed) {
		return null;
	}

	const quote = trimmed[0];
	if (quote === '"' || quote === "'") {
		const closingQuote = trimmed.indexOf(quote, 1);
		return closingQuote === -1
			? trimmed.slice(1)
			: trimmed.slice(1, closingQuote);
	}

	return trimmed.split(',')[0].trim();
};

const collectUsedFontFamilyNames = (ast: File): Set<string> => {
	const used = new Set<string>();
	const add = (fontFamily: string) => {
		const primary = getPrimaryFontFamilyName(fontFamily);
		if (primary) {
			used.add(normalizeFontFamilyName(primary));
		}
	};

	recast.types.visit(ast, {
		visitObjectProperty(path) {
			const {node} = path;
			if (node.key.type === 'Identifier' && node.key.name === 'fontFamily') {
				if (node.value.type === 'StringLiteral') {
					add(node.value.value);
				}

				if (
					node.value.type === 'TemplateLiteral' &&
					node.value.expressions.length === 0 &&
					node.value.quasis.length === 1
				) {
					add(
						node.value.quasis[0].value.cooked ?? node.value.quasis[0].value.raw,
					);
				}
			}

			this.traverse(path);
		},
		visitJSXAttribute(path) {
			const {node} = path;
			if (
				node.name.type === 'JSXIdentifier' &&
				node.name.name === 'fontFamily' &&
				node.value?.type === 'StringLiteral'
			) {
				add(node.value.value);
			}

			this.traverse(path);
		},
	});

	return used;
};

const isIdentifierImportedBySpecifier = ({
	parent,
	name,
}: {
	parent: unknown;
	name: string;
}) => {
	return (
		parent !== null &&
		typeof parent === 'object' &&
		'type' in parent &&
		parent.type === 'ImportSpecifier' &&
		'local' in parent &&
		parent.local !== null &&
		typeof parent.local === 'object' &&
		'type' in parent.local &&
		parent.local.type === 'Identifier' &&
		'name' in parent.local &&
		parent.local.name === name
	);
};

const hasNonImportIdentifierReference = ({
	ast,
	name,
}: {
	ast: File;
	name: string;
}) => {
	let hasReference = false;
	recast.types.visit(ast, {
		visitIdentifier(path) {
			if (path.node.name !== name) {
				this.traverse(path);
				return;
			}

			if (isIdentifierImportedBySpecifier({parent: path.parent.node, name})) {
				this.traverse(path);
				return;
			}

			hasReference = true;
			return false;
		},
	});

	return hasReference;
};

const googleFontLoadingComment =
	'Remotion Studio generated Google Font loading';

const hasStudioGeneratedGoogleFontLoadingComment = (statement: Statement) => {
	return (statement.leadingComments ?? []).some((comment) =>
		comment.value.includes(googleFontLoadingComment),
	);
};

const isTopLevelCallToIdentifier = ({
	statement,
	localName,
}: {
	statement: Statement;
	localName: string;
}) => {
	return (
		statement.type === 'ExpressionStatement' &&
		statement.expression.type === 'CallExpression' &&
		statement.expression.callee.type === 'Identifier' &&
		statement.expression.callee.name === localName
	);
};

const removeUnusedGoogleFontSourceEdits = (ast: File) => {
	const usedFonts = collectUsedFontFamilyNames(ast);
	const loadFontLocalNamesToRemove = new Set<string>();

	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			typeof statement.source.value !== 'string'
		) {
			continue;
		}

		const importName = getGoogleFontImportName(statement.source.value);
		if (!importName) {
			continue;
		}

		if (usedFonts.has(normalizeFontFamilyName(importName))) {
			continue;
		}

		for (const specifier of statement.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
				specifier.imported.type === 'Identifier' &&
				specifier.imported.name === 'loadFont'
			) {
				loadFontLocalNamesToRemove.add(specifier.local?.name ?? 'loadFont');
			}
		}
	}

	if (loadFontLocalNamesToRemove.size === 0) {
		return;
	}

	ast.program.body = ast.program.body.filter((statement) => {
		for (const localName of loadFontLocalNamesToRemove) {
			if (
				isTopLevelCallToIdentifier({statement, localName}) &&
				hasStudioGeneratedGoogleFontLoadingComment(statement)
			) {
				return false;
			}
		}

		return true;
	});

	ast.program.body = ast.program.body.filter((statement) => {
		if (statement.type !== 'ImportDeclaration') {
			return true;
		}

		statement.specifiers = (statement.specifiers ?? []).filter((specifier) => {
			return !(
				specifier.type === 'ImportSpecifier' &&
				specifier.imported.type === 'Identifier' &&
				specifier.imported.name === 'loadFont' &&
				loadFontLocalNamesToRemove.has(specifier.local?.name ?? 'loadFont') &&
				!hasNonImportIdentifierReference({
					ast,
					name: specifier.local?.name ?? 'loadFont',
				})
			);
		});

		return statement.specifiers.length > 0;
	});
};

const insertLoadFontCall = ({
	ast,
	font,
	localName,
}: {
	ast: File;
	font: GoogleFontSourceEdit;
	localName: string;
}) => {
	if (hasTopLevelLoadFontCall({ast, localName, font})) {
		return;
	}

	const call = b.expressionStatement(
		b.callExpression(b.identifier(localName), [
			b.stringLiteral(font.style),
			b.objectExpression([
				b.objectProperty(
					b.identifier('weights'),
					b.arrayExpression(
						font.weights.map((weight) => b.stringLiteral(weight)),
					),
				),
				b.objectProperty(
					b.identifier('subsets'),
					b.arrayExpression(
						font.subsets.map((subset) => b.stringLiteral(subset)),
					),
				),
			]),
		]),
	);
	call.comments = [b.commentLine(` ${googleFontLoadingComment}`)];

	insertAfterImportsOrDirectives(ast, call as Statement);
};

const applyGoogleFontSourceEdits = ({
	ast,
	updates,
}: {
	ast: File;
	updates: SequencePropUpdate[];
}) => {
	const fonts = new Map<string, GoogleFontSourceEdit>();
	let hasFontFamilyUpdate = false;
	for (const update of updates) {
		if (update.key === 'style.fontFamily') {
			hasFontFamilyUpdate = true;
		}

		if (update.googleFont) {
			fonts.set(update.googleFont.importName, update.googleFont);
		}
	}

	const usedNames = collectTopLevelIdentifierNames(ast);
	for (const font of fonts.values()) {
		const localName = ensureLoadFontImport({ast, font, usedNames});
		insertLoadFontCall({ast, font, localName});
	}

	if (hasFontFamilyUpdate) {
		removeUnusedGoogleFontSourceEdits(ast);
	}
};

const updateSequencePropsNode = ({
	jsxElement,
	updates,
	schema,
	videoConfigValues,
}: {
	jsxElement: JSXElementLike;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
	videoConfigValues: VideoConfigIdentifierValues;
}): {
	oldValueStrings: string[];
	logLine: number;
	removedProps: RemovedProp[];
} => {
	const node = jsxElement.openingElement;
	const logLine = node.loc?.start.line ?? 1;

	const oldValueStrings: string[] = [];
	const initialAttrs = snapshotTopLevelAttrs(node);
	const updatedTopLevelKeys = new Set(
		updates.map(({key}) => {
			const dot = key.indexOf('.');
			return dot === -1 ? key : key.slice(0, dot);
		}),
	);
	const createValueExpression = ({
		existing,
		value,
	}: {
		existing: Expression | null;
		value: unknown;
	}) => {
		if (existing === null || typeof value !== 'number') {
			return parseValueExpression(value);
		}

		const expression = parseVideoConfigNumericExpression({
			node: existing,
			videoConfigValues,
		});
		if (expression === null) {
			return parseValueExpression(value);
		}

		return expression.value === value
			? (existing as ExpressionKind)
			: updateVideoConfigNumericExpression({expression, value});
	};

	for (const {key, value, defaultValue} of updates) {
		let oldValueString = '';

		if (key === 'children') {
			oldValueString = updateJsxTextContent({jsxElement, value});
			oldValueStrings.push(oldValueString);
			continue;
		}

		const isDefault =
			(defaultValue === null && value === undefined) ||
			(defaultValue !== null &&
				JSON.stringify(value) === JSON.stringify(defaultValue));

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
				createValueExpression: (existing) =>
					createValueExpression({existing, value}),
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
				const existingExpression =
					attr?.type === 'JSXAttribute' &&
					attr.value?.type === 'JSXExpressionContainer' &&
					attr.value.expression.type !== 'JSXEmptyExpression'
						? (attr.value.expression as Expression)
						: null;
				const parsed = createValueExpression({
					existing: existingExpression,
					value,
				});

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
	videoConfigValues,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
	videoConfigValues: VideoConfigValues | null;
}): {
	serialized: string;
	oldValueStrings: string[];
	logLine: number;
	removedProps: RemovedProp[];
} => {
	const ast = parseAst(input);
	const videoConfigIdentifierValues = getVideoConfigIdentifierValues({
		ast,
		videoConfigValues,
	});

	const jsxElement = findJsxElementNodeAtNodePath(ast, nodePath);
	if (!jsxElement) {
		throw new Error(
			'Could not find a JSX element at the specified line to update',
		);
	}

	const {oldValueStrings, logLine, removedProps} = updateSequencePropsNode({
		jsxElement,
		updates,
		schema,
		videoConfigValues: videoConfigIdentifierValues,
	});
	applyGoogleFontSourceEdits({ast, updates});

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
	const allUpdates: SequencePropUpdate[] = [];
	const results = changes.map(
		({nodePath, updates, schema, videoConfigValues}) => {
			const jsxElement = findJsxElementNodeAtNodePath(ast, nodePath);
			if (!jsxElement) {
				throw new Error(
					'Could not find a JSX element at the specified line to update',
				);
			}

			allUpdates.push(...updates);
			return updateSequencePropsNode({
				jsxElement,
				updates,
				schema,
				videoConfigValues: getVideoConfigIdentifierValues({
					ast,
					videoConfigValues,
				}),
			});
		},
	);
	applyGoogleFontSourceEdits({ast, updates: allUpdates});

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
	videoConfigValues,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
	prettierConfigOverride: PrettierConfigOverride;
	videoConfigValues: VideoConfigValues | null;
}): Promise<UpdateSequencePropsResult> => {
	const {serialized, oldValueStrings, logLine, removedProps} =
		updateSequencePropsAst({
			input,
			nodePath,
			updates,
			schema,
			videoConfigValues,
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

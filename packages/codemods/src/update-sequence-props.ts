import type {
	JSXAttribute,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
	JSXSpreadAttribute,
	ObjectProperty,
	StringLiteral,
	Expression,
	File,
	Statement,
} from '@babel/types';
import type {
	EffectClipboardParam,
	GoogleFontSourceEdit,
} from '@remotion/studio-shared';
import type {namedTypes as AstNamedTypes} from 'ast-types';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import type {
	InteractivitySchema,
	SequenceNodePath,
	VideoConfigValues,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	captureFunctionSourceSnapshots,
	getFunctionSourceEditsForPrependedStatements,
	type FunctionNode,
} from './function-source-edits';
import {
	captureJsxAttributeSources,
	printInsertedJsx,
	printJsxOpeningElement,
} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {
	findNodePathForJsxElement,
	findJsxElementNodeAtNodePath,
	getStaticJsxChildrenAttribute,
	getStaticJsxTextContent,
	hasJsxChildrenAttribute,
	retimeSequenceKeyframes,
} from './sequence-props';
import {
	ensureClipboardParamRemotionImports,
	getRequiredRemotionImportsForClipboardParams,
	makeClipboardParamExpression,
	type ClipboardParamRemotionLocalNames,
} from './sequence-props/clipboard-param-expression';
import {
	getCssShorthandsForUpdates,
	type CssShorthandProperty,
} from './sequence-props/css-shorthand-properties';
import {ensureNamedImports} from './sequence-props/imports';
import {parseAst, serializeAst} from './sequence-props/parse-ast';
import {
	parseVideoConfigNumericExpression,
	updateVideoConfigNumericExpression,
} from './sequence-props/video-config-numeric-expression';
import {
	getVideoConfigIdentifierValues,
	type VideoConfigIdentifierValues,
} from './sequence-props/video-config-values';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
	type SourceEdit,
} from './source-edits';
import {
	getEndOfLine,
	getIndentationUnit,
	getLineIndent,
	getObjectCurlySpacing,
	getPreferredQuote,
	indentContinuationLines,
	printNodeWithSourceStyle,
} from './source-style';
import {parseValueExpression, updateNestedProp} from './update-nested-prop';

const b = recast.types.builders;

export type SequencePropUpdate = {
	key: string;
	value: unknown;
	defaultValue: unknown | null;
	googleFont?: GoogleFontSourceEdit | null;
	clipboardParam?: EffectClipboardParam | null;
	retimeKeyframes?: boolean;
};

const ensureImportsForUpdates = ({
	ast,
	updates,
}: {
	ast: File;
	updates: SequencePropUpdate[];
}) => {
	if (
		updates.some(
			({value, defaultValue}) =>
				typeof value === 'string' &&
				value.startsWith(NoReactInternals.FILE_TOKEN) &&
				(defaultValue === null ||
					JSON.stringify(value) !== JSON.stringify(defaultValue)),
		)
	) {
		ensureNamedImports({
			ast,
			importedNames: new Set(['staticFile']),
			sourcePath: 'remotion',
		});
	}
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
	newNodePath: SequenceNodePath;
};

export type UpdateMultipleSequencePropsResult = {
	output: string;
	results: SequencePropsNodeUpdateResult[];
	ast: File;
	openingElementRanges: Array<{
		start: number;
		end: number;
		selfClosing: boolean;
	}> | null;
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

const isFunctionNode = (value: unknown): value is FunctionNode => {
	return (
		recast.types.namedTypes.FunctionDeclaration.check(value) ||
		recast.types.namedTypes.FunctionExpression.check(value) ||
		recast.types.namedTypes.ArrowFunctionExpression.check(value)
	);
};

const ensureUseCurrentFrameHook = ({
	ast,
	jsxElement,
	hookName,
}: {
	ast: File;
	jsxElement: JSXElementLike;
	hookName: string;
}) => {
	let functionPath: recast.types.NodePath | null = null;
	recast.types.visit(ast, {
		visitJSXElement(path) {
			if (path.node !== jsxElement) {
				return this.traverse(path);
			}

			let current: recast.types.NodePath | null = path.parentPath;
			while (current) {
				if (isFunctionNode(current.value)) {
					functionPath = current;
					return false;
				}

				current = current.parentPath;
			}

			return false;
		},
	});

	const enclosingFunctionPath = functionPath as recast.types.NodePath | null;
	if (enclosingFunctionPath === null) {
		return;
	}

	const fn = enclosingFunctionPath.value as FunctionNode;
	if (!recast.types.namedTypes.BlockStatement.check(fn.body)) {
		fn.body = b.blockStatement([
			b.returnStatement(fn.body as Parameters<typeof b.returnStatement>[0]),
		]) as unknown as FunctionNode['body'];
	}

	const block = fn.body as Extract<
		FunctionNode['body'],
		{type: 'BlockStatement'}
	>;
	const hasFrame = block.body.some((statement) => {
		return (
			statement.type === 'VariableDeclaration' &&
			statement.declarations.some(
				(declaration) =>
					declaration.type === 'VariableDeclarator' &&
					declaration.id.type === 'Identifier' &&
					declaration.id.name === 'frame' &&
					declaration.init?.type === 'CallExpression' &&
					declaration.init.callee.type === 'Identifier' &&
					declaration.init.callee.name === hookName,
			)
		);
	});
	if (hasFrame) {
		return;
	}

	block.body.unshift(
		b.variableDeclaration('const', [
			b.variableDeclarator(
				b.identifier('frame'),
				b.callExpression(b.identifier(hookName), []),
			),
		]) as unknown as (typeof block.body)[number],
	);
};

const prepareClipboardParamSourceEdits = ({
	ast,
	changes,
}: {
	ast: File;
	changes: {
		readonly jsxElement: JSXElementLike;
		readonly updates: SequencePropUpdate[];
	}[];
}): ClipboardParamRemotionLocalNames => {
	const params = changes.flatMap(({updates}) =>
		updates.flatMap((update) =>
			update.clipboardParam ? [update.clipboardParam] : [],
		),
	);
	const requiredImports = getRequiredRemotionImportsForClipboardParams(params);
	const localNames = ensureClipboardParamRemotionImports({
		ast,
		requiredImports,
	});

	if (requiredImports.has('useCurrentFrame')) {
		for (const {jsxElement, updates} of changes) {
			if (
				updates.some((update) => update.clipboardParam?.type === 'keyframed')
			) {
				ensureUseCurrentFrameHook({
					ast,
					jsxElement,
					hookName: localNames.useCurrentFrame ?? 'useCurrentFrame',
				});
			}
		}
	}

	return localNames;
};

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

const migrateCssShorthand = ({
	node,
	cssShorthand,
}: {
	node: JSXOpeningElementLike;
	cssShorthand: CssShorthandProperty;
}) => {
	const styleAttribute = node.attributes?.find(
		(attribute) =>
			attribute.type === 'JSXAttribute' &&
			attribute.name.type === 'JSXIdentifier' &&
			attribute.name.name === 'style',
	);
	if (
		styleAttribute?.type !== 'JSXAttribute' ||
		styleAttribute.value?.type !== 'JSXExpressionContainer' ||
		styleAttribute.value.expression.type !== 'ObjectExpression'
	) {
		return;
	}

	const {properties} = styleAttribute.value.expression;
	for (let index = 0; index < properties.length; index++) {
		const property = properties[index];
		if (
			property.type !== 'ObjectProperty' ||
			!(
				(property.key.type === 'Identifier' &&
					property.key.name === cssShorthand.shorthand) ||
				(property.key.type === 'StringLiteral' &&
					property.key.value === cssShorthand.shorthand)
			)
		) {
			continue;
		}

		const shorthandValue =
			property.value.type === 'StringLiteral'
				? property.value.value
				: property.value.type === 'NumericLiteral'
					? property.value.value
					: property.value.type === 'TemplateLiteral' &&
						  property.value.expressions.length === 0
						? (property.value.quasis[0]?.value.cooked ?? null)
						: null;
		if (shorthandValue === null) {
			continue;
		}

		const parsed = cssShorthand.parse(shorthandValue);
		if (!parsed) {
			continue;
		}

		properties.splice(
			index,
			1,
			...cssShorthand.longhands.map((longhand) => {
				const value = parsed[longhand];
				return b.objectProperty(
					b.identifier(longhand),
					typeof value === 'number'
						? b.numericLiteral(value)
						: b.stringLiteral(value),
				) as ObjectProperty;
			}),
		);
		index += cssShorthand.longhands.length - 1;
	}
};

const updateSequencePropsNode = ({
	jsxElement,
	updates,
	schema,
	videoConfigValues,
	clipboardParamLocalNames,
}: {
	jsxElement: JSXElementLike;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
	videoConfigValues: VideoConfigIdentifierValues;
	clipboardParamLocalNames: ClipboardParamRemotionLocalNames;
}): {
	oldValueStrings: string[];
	logLine: number;
	removedProps: RemovedProp[];
} => {
	const node = jsxElement.openingElement;
	const logLine = node.loc?.start.line ?? 1;
	for (const cssShorthand of getCssShorthandsForUpdates(
		updates.map((update) => update.key),
	)) {
		migrateCssShorthand({node, cssShorthand});
	}

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
		clipboardParam,
	}: {
		existing: Expression | null;
		value: unknown;
		clipboardParam: EffectClipboardParam | null | undefined;
	}) => {
		if (clipboardParam) {
			return makeClipboardParamExpression({
				param: clipboardParam,
				localNames: clipboardParamLocalNames,
			});
		}

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

	for (const {key, value, defaultValue, clipboardParam} of updates) {
		let oldValueString = '';

		if (key === 'children') {
			oldValueString = updateJsxTextContent({jsxElement, value});
			oldValueStrings.push(oldValueString);
			continue;
		}

		const isDefault =
			!clipboardParam &&
			((defaultValue === null && value === undefined) ||
				(defaultValue !== null &&
					JSON.stringify(value) === JSON.stringify(defaultValue)));

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
					createValueExpression({existing, value, clipboardParam}),
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
					clipboardParam,
				});

				const newValue =
					value === true && !clipboardParam
						? null
						: b.jsxExpressionContainer(parsed);

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

	const clipboardParamLocalNames = prepareClipboardParamSourceEdits({
		ast,
		changes: [{jsxElement, updates}],
	});

	const {oldValueStrings, logLine, removedProps} = updateSequencePropsNode({
		jsxElement,
		updates,
		schema,
		videoConfigValues: videoConfigIdentifierValues,
		clipboardParamLocalNames,
	});
	ensureImportsForUpdates({ast, updates});
	applyGoogleFontSourceEdits({ast, updates});

	return {
		serialized: serializeAst(ast),
		oldValueStrings,
		logLine,
		removedProps,
	};
};

const getProgramStatementSourceEdits = ({
	ast,
	input,
	originalBody,
	prettierConfigOverride,
}: {
	ast: File;
	input: string;
	originalBody: Statement[];
	prettierConfigOverride: Record<string, unknown> | null;
}): SourceEdit[] => {
	const edits: SourceEdit[] = [];
	const currentStatements = new Set(ast.program.body);
	for (const statement of originalBody) {
		if (currentStatements.has(statement) || !statement.loc) {
			continue;
		}

		const leadingCommentStarts = (statement.leadingComments ?? []).flatMap(
			(comment) =>
				comment.loc ? [recastLocToOffset(input, comment.loc.start)] : [],
		);
		edits.push({
			start: Math.min(
				recastLocToOffset(input, statement.loc.start),
				...leadingCommentStarts,
			),
			end: recastLocToOffset(input, statement.loc.end),
			replacement: '',
		});
	}

	const originalStatements = new Set(originalBody);
	const endOfLine = getEndOfLine(input);
	for (let index = 0; index < ast.program.body.length; index++) {
		const statement = ast.program.body[index];
		if (
			originalStatements.has(statement) ||
			statement.type === 'ImportDeclaration'
		) {
			continue;
		}

		const inserted: Statement[] = [statement];
		while (
			index + 1 < ast.program.body.length &&
			!originalStatements.has(ast.program.body[index + 1]) &&
			ast.program.body[index + 1].type !== 'ImportDeclaration'
		) {
			inserted.push(ast.program.body[++index]);
		}

		const nextOriginal = ast.program.body
			.slice(index + 1)
			.find((candidate) => originalStatements.has(candidate) && candidate.loc);
		const printed = inserted
			.map((candidate) =>
				printNodeWithSourceStyle({
					input,
					node: candidate as unknown as AstNamedTypes.Node,
					prettierConfigOverride,
					wrapColumn: null,
				}),
			)
			.join(`${endOfLine}${endOfLine}`);
		if (nextOriginal?.loc) {
			const nextOffset = recastLocToOffset(input, nextOriginal.loc.start);
			edits.push({
				start: nextOffset,
				end: nextOffset,
				replacement: `${printed}${endOfLine}${endOfLine}`,
			});
			continue;
		}

		const previousOriginal = ast.program.body
			.slice(0, index - inserted.length + 1)
			.findLast(
				(candidate) => originalStatements.has(candidate) && candidate.loc,
			);
		const offset = previousOriginal?.loc
			? recastLocToOffset(input, previousOriginal.loc.end)
			: input.length;
		edits.push({
			start: offset,
			end: offset,
			replacement: `${endOfLine}${endOfLine}${printed}`,
		});
	}

	return edits;
};

export const updateMultipleSequenceProps = ({
	input,
	changes,
	ast: providedAst,
	prettierConfigOverride,
}: {
	input: string;
	changes: SequencePropsNodeUpdate[];
	ast?: File;
	prettierConfigOverride?: Record<string, unknown> | null;
}): UpdateMultipleSequencePropsResult => {
	const ast = providedAst ?? parseAst(input);
	const prettierConfig = prettierConfigOverride ?? null;
	const jsxFormattingConfig = {
		bracketSpacing: getObjectCurlySpacing(input, prettierConfig),
		singleQuote: getPreferredQuote(input, prettierConfig) === 'single',
		...(prettierConfig ?? {}),
	};
	const originalProgramBody = [...ast.program.body];
	const importSnapshots = captureImportSnapshots(ast);
	const functionSnapshots = captureFunctionSourceSnapshots(ast);
	const getJsxSourceIndent = (offset: number) => {
		const lineStart = input.lastIndexOf('\n', offset - 1) + 1;
		const startsInsideSameLineFunctionBlock = functionSnapshots.some(
			({body}) => {
				if (body.type !== 'BlockStatement' || !body.loc) {
					return false;
				}

				const blockStart = recastLocToOffset(input, body.loc.start);
				const blockEnd = recastLocToOffset(input, body.loc.end);
				return (
					blockStart < offset &&
					offset < blockEnd &&
					input.lastIndexOf('\n', blockStart - 1) + 1 === lineStart
				);
			},
		);
		const lineIndent = getLineIndent({input, offset});
		return startsInsideSameLineFunctionBlock
			? `${lineIndent}${getIndentationUnit(input, prettierConfig)}`
			: lineIndent;
	};

	const resolvedChanges = changes.map(
		({nodePath, updates, schema, videoConfigValues}) => {
			const jsxElement = findJsxElementNodeAtNodePath(ast, nodePath);
			if (!jsxElement) {
				throw new Error(
					'Could not find a JSX element at the specified line to update',
				);
			}

			return {jsxElement, updates, schema, videoConfigValues};
		},
	);
	const elementsWithChildrenUpdates = new Set(
		resolvedChanges.flatMap(({jsxElement, updates}) =>
			updates.some((update) => update.key === 'children') ? [jsxElement] : [],
		),
	);
	const elementsToPrint = new Set(
		resolvedChanges.map(({jsxElement}) => jsxElement),
	);
	for (const {jsxElement, updates} of resolvedChanges) {
		if (!updates.some((update) => update.retimeKeyframes)) {
			continue;
		}

		recast.types.visit(jsxElement, {
			visitJSXElement(p) {
				elementsToPrint.add(p.node as unknown as JSXElement);
				return this.traverse(p);
			},
		});
	}

	const originalAttributeSources = new Map(
		[...elementsToPrint].flatMap((jsxElement) => [
			...captureJsxAttributeSources(jsxElement),
		]),
	);
	const openingElementLocations = new Map(
		[...elementsToPrint].flatMap((jsxElement) =>
			elementsWithChildrenUpdates.has(jsxElement)
				? []
				: [[jsxElement.openingElement, jsxElement.openingElement.loc] as const],
		),
	);
	const elementLocations = new Map(
		resolvedChanges.flatMap(({jsxElement}) =>
			elementsWithChildrenUpdates.has(jsxElement)
				? [[jsxElement, jsxElement.loc] as const]
				: [],
		),
	);
	for (const {jsxElement, updates, videoConfigValues} of resolvedChanges) {
		for (const update of updates) {
			if (update.key === 'playbackRate' && update.retimeKeyframes) {
				retimeSequenceKeyframes({
					ast,
					jsxElement,
					playbackRate: typeof update.value === 'number' ? update.value : 1,
					videoConfigValues: getVideoConfigIdentifierValues({
						ast,
						videoConfigValues,
					}),
				});
			}
		}
	}

	const clipboardParamLocalNames = prepareClipboardParamSourceEdits({
		ast,
		changes: resolvedChanges,
	});
	const allUpdates: SequencePropUpdate[] = [];
	const updateResults = resolvedChanges.map(
		({jsxElement, updates, schema, videoConfigValues}) => {
			allUpdates.push(...updates);
			return {
				jsxElement,
				result: updateSequencePropsNode({
					jsxElement,
					updates,
					schema,
					videoConfigValues: getVideoConfigIdentifierValues({
						ast,
						videoConfigValues,
					}),
					clipboardParamLocalNames,
				}),
			};
		},
	);
	ensureImportsForUpdates({ast, updates: allUpdates});
	applyGoogleFontSourceEdits({ast, updates: allUpdates});
	const results = updateResults.map(({jsxElement, result}) => {
		const newNodePath = findNodePathForJsxElement(
			ast,
			jsxElement.openingElement,
		);
		if (!newNodePath) {
			throw new Error('Could not determine the updated JSX element path');
		}

		return {...result, newNodePath};
	});
	const {coveredRanges, edits: functionEdits} =
		getFunctionSourceEditsForPrependedStatements({
			indentationUnit: getIndentationUnit(input, prettierConfig),
			input,
			printNode: (node) =>
				printNodeWithSourceStyle({
					input,
					node,
					prettierConfigOverride: prettierConfig,
					wrapColumn: null,
				}),
			reprintBlockBodies: new Set(),
			snapshots: functionSnapshots,
		});
	const isCoveredByFunctionEdit = (start: number, end: number) =>
		coveredRanges.some((range) => start >= range.start && end <= range.end);
	const elementEdits: SourceEdit[] = [];
	for (const [openingElement, location] of openingElementLocations) {
		if (!location) {
			continue;
		}

		const start = recastLocToOffset(input, location.start);
		const end = recastLocToOffset(input, location.end);
		if (isCoveredByFunctionEdit(start, end)) {
			continue;
		}

		const original = input.slice(start, end);
		if (recast.print(openingElement).code === original) {
			continue;
		}

		elementEdits.push({
			start,
			end,
			replacement: indentContinuationLines({
				indent: getJsxSourceIndent(start),
				input,
				printed: printJsxOpeningElement({
					compactLiteralProps: false,
					originalAttributeSources,
					openingElement:
						openingElement as unknown as AstNamedTypes.JSXOpeningElement,
					input,
					prettierConfigOverride: jsxFormattingConfig,
				}),
			}),
		});
	}

	for (const [element, location] of elementLocations) {
		if (!location) {
			continue;
		}

		const start = recastLocToOffset(input, location.start);
		const end = recastLocToOffset(input, location.end);
		if (isCoveredByFunctionEdit(start, end)) {
			continue;
		}

		const original = input.slice(start, end);
		if (recast.print(element).code === original) {
			continue;
		}

		elementEdits.push({
			start,
			end,
			replacement: indentContinuationLines({
				indent: getJsxSourceIndent(start),
				input,
				printed: printInsertedJsx({
					compactLiteralProps: false,
					originalAttributeSources,
					element: element as unknown as AstNamedTypes.JSXElement,
					input,
					prettierConfigOverride: jsxFormattingConfig,
				}),
			}),
		});
	}

	const modifiedImportEdits = importSnapshots.flatMap((snapshot) => {
		if (
			!ast.program.body.includes(snapshot.declaration) ||
			!snapshot.declaration.loc ||
			snapshot.specifiers.every((specifier) =>
				snapshot.declaration.specifiers.includes(specifier),
			)
		) {
			return [];
		}

		const start = recastLocToOffset(input, snapshot.declaration.loc.start);
		const end = recastLocToOffset(input, snapshot.declaration.loc.end);
		return [
			{
				start,
				end,
				replacement: printNodeWithSourceStyle({
					input,
					node: snapshot.declaration as unknown as AstNamedTypes.Node,
					prettierConfigOverride: prettierConfig,
					wrapColumn: null,
				}),
			},
		];
	});
	const insertedImportEdits = getInsertImportSourceEdits({
		ast,
		input,
		prettierConfigOverride: jsxFormattingConfig,
		snapshots: importSnapshots,
	});
	const importEdits = [
		...modifiedImportEdits,
		...insertedImportEdits.filter((edit) =>
			modifiedImportEdits.every(
				(modified) => edit.end <= modified.start || edit.start >= modified.end,
			),
		),
	];
	const programStatementEdits = getProgramStatementSourceEdits({
		ast,
		input,
		originalBody: originalProgramBody,
		prettierConfigOverride: prettierConfig,
	});
	const output = applySourceEdits({
		input,
		edits: [
			...programStatementEdits,
			...importEdits,
			...functionEdits,
			...elementEdits,
		],
	});

	return {
		output,
		results,
		ast,
		openingElementRanges: null,
	};
};

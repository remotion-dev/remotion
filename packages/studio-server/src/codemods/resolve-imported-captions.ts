import {existsSync, readFileSync, realpathSync} from 'node:fs';
import path from 'node:path';
import type {Expression, File, JSXOpeningElement} from '@babel/types';
import {parseAst} from './parse-ast';

const extensions = ['.ts', '.tsx', '.js', '.jsx'] as const;

export type ImportedCaptionSource = {
	readonly absolutePath: string;
	readonly fileRelativeToRoot: string;
	readonly exportName: string;
	readonly captions: unknown[];
};

const getCaptionsIdentifier = (
	jsxElement: JSXOpeningElement,
): string | null => {
	const attribute = jsxElement.attributes.find(
		(candidate) =>
			candidate.type === 'JSXAttribute' &&
			candidate.name.type === 'JSXIdentifier' &&
			candidate.name.name === 'captions',
	);
	if (
		!attribute ||
		attribute.type !== 'JSXAttribute' ||
		attribute.value?.type !== 'JSXExpressionContainer' ||
		attribute.value.expression.type !== 'Identifier'
	) {
		return null;
	}

	return attribute.value.expression.name;
};

const resolveLocalModule = ({
	ownerAbsolutePath,
	importPath,
	remotionRoot,
}: {
	ownerAbsolutePath: string;
	importPath: string;
	remotionRoot: string;
}): {absolutePath: string; fileRelativeToRoot: string} | null => {
	if (!importPath.startsWith('.')) {
		return null;
	}

	const basePath = path.resolve(path.dirname(ownerAbsolutePath), importPath);
	const candidates = path.extname(basePath)
		? [basePath]
		: [
				...extensions.map((extension) => `${basePath}${extension}`),
				...extensions.map((extension) =>
					path.join(basePath, `index${extension}`),
				),
			];
	const resolvedRoot = realpathSync(path.resolve(remotionRoot));
	for (const candidate of candidates) {
		if (!existsSync(candidate)) {
			continue;
		}

		const resolvedCandidate = realpathSync(candidate);
		const relative = path.relative(resolvedRoot, resolvedCandidate);
		if (
			relative === '..' ||
			relative.startsWith(`..${path.sep}`) ||
			path.isAbsolute(relative)
		) {
			continue;
		}

		return {absolutePath: resolvedCandidate, fileRelativeToRoot: relative};
	}

	return null;
};

const isStaticValue = (expression: Expression): boolean => {
	if (
		expression.type === 'StringLiteral' ||
		expression.type === 'NumericLiteral' ||
		expression.type === 'BooleanLiteral' ||
		expression.type === 'NullLiteral'
	) {
		return true;
	}

	if (
		expression.type === 'TSAsExpression' ||
		expression.type === 'TSSatisfiesExpression'
	) {
		return isStaticValue(expression.expression as Expression);
	}

	if (expression.type === 'ArrayExpression') {
		return expression.elements.every(
			(element) =>
				element !== null &&
				element.type !== 'SpreadElement' &&
				isStaticValue(element as Expression),
		);
	}

	if (expression.type === 'ObjectExpression') {
		return expression.properties.every(
			(property) =>
				property.type === 'ObjectProperty' &&
				!property.computed &&
				isStaticValue(property.value as Expression),
		);
	}

	return false;
};

const extractStaticValue = (expression: Expression): unknown => {
	if (
		expression.type === 'StringLiteral' ||
		expression.type === 'NumericLiteral' ||
		expression.type === 'BooleanLiteral'
	) {
		return expression.value;
	}

	if (expression.type === 'NullLiteral') {
		return null;
	}

	if (
		expression.type === 'TSAsExpression' ||
		expression.type === 'TSSatisfiesExpression'
	) {
		return extractStaticValue(expression.expression as Expression);
	}

	if (expression.type === 'ArrayExpression') {
		return expression.elements.map((element) =>
			element === null || element.type === 'SpreadElement'
				? undefined
				: extractStaticValue(element as Expression),
		);
	}

	if (expression.type === 'ObjectExpression') {
		return Object.fromEntries(
			expression.properties
				.filter((property) => property.type === 'ObjectProperty')
				.map((property) => [
					property.key.type === 'Identifier'
						? property.key.name
						: property.key.type === 'StringLiteral'
							? property.key.value
							: '',
					extractStaticValue(property.value as Expression),
				]),
		);
	}

	return undefined;
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

export const resolveImportedCaptions = ({
	ownerAst,
	jsxElement,
	ownerAbsolutePath,
	remotionRoot,
	readFile = readFileSync,
}: {
	ownerAst: File;
	jsxElement: JSXOpeningElement;
	ownerAbsolutePath: string;
	remotionRoot: string;
	readFile?: (path: string, encoding: 'utf-8') => string;
}): ImportedCaptionSource | null => {
	const localName = getCaptionsIdentifier(jsxElement);
	if (localName === null) {
		return null;
	}

	const matchingImport = ownerAst.program.body.find((statement) => {
		if (statement.type !== 'ImportDeclaration') {
			return false;
		}

		return statement.specifiers.some(
			(importSpecifier) =>
				importSpecifier.type === 'ImportSpecifier' &&
				importSpecifier.local.name === localName,
		);
	});
	if (!matchingImport || matchingImport.type !== 'ImportDeclaration') {
		return null;
	}

	const specifier = matchingImport.specifiers.find(
		(candidate) =>
			candidate.type === 'ImportSpecifier' &&
			candidate.local.name === localName,
	);
	if (!specifier || specifier.type !== 'ImportSpecifier') {
		return null;
	}

	const exportName =
		specifier.imported.type === 'Identifier'
			? specifier.imported.name
			: specifier.imported.value;
	const module = resolveLocalModule({
		ownerAbsolutePath,
		importPath: matchingImport.source.value,
		remotionRoot,
	});
	if (module === null) {
		return null;
	}

	const moduleAst = parseAst(readFile(module.absolutePath, 'utf-8'));
	const declaration = moduleAst.program.body.find((statement) => {
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
		declaration.declaration?.type !== 'VariableDeclaration'
	) {
		return null;
	}

	const variable = declaration.declaration.declarations.find(
		(candidate) =>
			candidate.id.type === 'Identifier' && candidate.id.name === exportName,
	);
	if (!variable?.init) {
		return null;
	}

	const value = unwrapTypeExpression(variable.init as Expression);
	if (value.type !== 'ArrayExpression' || !isStaticValue(value)) {
		return null;
	}

	const captions = extractStaticValue(value);
	if (!Array.isArray(captions)) {
		return null;
	}

	return {...module, exportName, captions};
};

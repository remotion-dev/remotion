import type {
	ArrayExpression,
	ClassDeclaration,
	Expression,
	File,
	FunctionDeclaration,
	JSXAttribute,
	JSXOpeningElement,
	ObjectExpression,
	ObjectProperty,
	VariableDeclaration,
} from '@babel/types';
import {stringifyDefaultProps} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {ensureNamedImport} from '../helpers/imports';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';
import {findEffectsAttr} from './update-effect-props/update-effect-props';

const b = recast.types.builders;

const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

export const assertValidEffect = ({
	effectName,
	effectImportPath,
}: {
	effectName: string;
	effectImportPath: string;
}) => {
	if (!identifierRegex.test(effectName)) {
		throw new Error(`Invalid effect name "${effectName}"`);
	}

	const allowedImport =
		effectImportPath.startsWith('@remotion/effects/') ||
		effectImportPath === '@remotion/light-leaks' ||
		effectImportPath === '@remotion/starburst';

	if (!allowedImport) {
		throw new Error(`Unsupported effect import "${effectImportPath}"`);
	}
};

const parseValueExpression = (value: unknown): Expression => {
	const code = `a = ${stringifyDefaultProps({props: value, enumPaths: []})}`;
	const ast = parseAst(code);
	const stmt = ast.program.body[0];
	if (
		stmt.type !== 'ExpressionStatement' ||
		stmt.expression.type !== 'AssignmentExpression'
	) {
		throw new Error('Failed to parse effect config value');
	}

	return stmt.expression.right as Expression;
};

const declarationBindsName = (
	declaration: ClassDeclaration | FunctionDeclaration | VariableDeclaration,
	name: string,
) => {
	if (declaration.type === 'ClassDeclaration') {
		return declaration.id?.name === name;
	}

	if (declaration.type === 'FunctionDeclaration') {
		return declaration.id?.name === name;
	}

	return declaration.declarations.some((variableDeclaration) => {
		return (
			variableDeclaration.id.type === 'Identifier' &&
			variableDeclaration.id.name === name
		);
	});
};

const hasTopLevelBinding = ({ast, name}: {ast: File; name: string}) => {
	return ast.program.body.some((node) => {
		if (
			node.type === 'FunctionDeclaration' ||
			node.type === 'ClassDeclaration' ||
			node.type === 'VariableDeclaration'
		) {
			return declarationBindsName(node, name);
		}

		if (
			node.type === 'ExportNamedDeclaration' &&
			node.declaration &&
			(node.declaration.type === 'FunctionDeclaration' ||
				node.declaration.type === 'ClassDeclaration' ||
				node.declaration.type === 'VariableDeclaration')
		) {
			return declarationBindsName(node.declaration, name);
		}

		if (node.type !== 'ImportDeclaration') {
			return false;
		}

		return node.specifiers?.some((specifier) => specifier.local?.name === name);
	});
};

const getAvailableLocalName = ({
	ast,
	effectName,
}: {
	ast: File;
	effectName: string;
}) => {
	if (!hasTopLevelBinding({ast, name: effectName})) {
		return effectName;
	}

	const base = `${effectName}Effect`;
	if (!hasTopLevelBinding({ast, name: base})) {
		return base;
	}

	for (let i = 2; i < 100; i++) {
		const candidate = `${base}${i}`;
		if (!hasTopLevelBinding({ast, name: candidate})) {
			return candidate;
		}
	}

	throw new Error(`Cannot find a local name for ${effectName}`);
};

export const ensureEffectImport = ({
	ast,
	effectName,
	effectImportPath,
}: {
	ast: File;
	effectName: string;
	effectImportPath: string;
}) => {
	const localName = getAvailableLocalName({ast, effectName});
	return ensureNamedImport({
		ast,
		importedName: effectName,
		sourcePath: effectImportPath,
		localName,
	});
};

const getEffectsArray = (attr: JSXAttribute): ArrayExpression => {
	if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
		throw new Error('Cannot add effect: effects prop is not an array');
	}

	const expr = attr.value.expression as Expression;
	if (expr.type !== 'ArrayExpression') {
		throw new Error('Cannot add effect: effects prop is not an array');
	}

	return expr;
};

const makeEffectsAttr = (array: ArrayExpression): JSXAttribute => {
	return b.jsxAttribute(
		b.jsxIdentifier('effects'),
		b.jsxExpressionContainer(array as never),
	) as unknown as JSXAttribute;
};

export const makeConfigObjectExpression = (
	config: Record<string, unknown>,
): ObjectExpression => {
	return b.objectExpression(
		Object.entries(config).map(([key, value]) => {
			const keyNode = identifierRegex.test(key)
				? b.identifier(key)
				: b.stringLiteral(key);
			return b.objectProperty(
				keyNode as never,
				parseValueExpression(value) as never,
			) as unknown as ObjectProperty;
		}) as never,
	) as unknown as ObjectExpression;
};

const getJsxTagLabel = (name: JSXOpeningElement['name']) => {
	if (name.type === 'JSXIdentifier') {
		return `<${name.name}>`;
	}

	return 'element';
};

export const addEffect = async ({
	input,
	sequenceNodePath,
	effectName,
	effectImportPath,
	effectConfig,
	prettierConfigOverride,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectName: string;
	effectImportPath: string;
	effectConfig: Record<string, unknown>;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	effectLabel: string;
	nodeLabel: string;
	logLine: number;
}> => {
	assertValidEffect({effectName, effectImportPath});

	const ast = parseAst(input);
	const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
	if (!jsx) {
		throw new Error(
			'Could not find a JSX element at the specified location to add effect',
		);
	}

	const localName = ensureEffectImport({ast, effectName, effectImportPath});
	const effectCall = b.callExpression(b.identifier(localName), [
		makeConfigObjectExpression(effectConfig) as never,
	]);

	const attr = findEffectsAttr(jsx.attributes ?? []);
	if (attr) {
		getEffectsArray(attr).elements.push(effectCall as never);
	} else {
		const effectsArray = b.arrayExpression([effectCall]) as ArrayExpression;
		jsx.attributes.push(makeEffectsAttr(effectsArray));
	}

	const finalFile = serializeAst(ast);
	const {output, formatted} = await formatFileContent({
		input: finalFile,
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		effectLabel: `${effectName}()`,
		nodeLabel: getJsxTagLabel(jsx.name),
		logLine: jsx.loc?.start.line ?? 1,
	};
};

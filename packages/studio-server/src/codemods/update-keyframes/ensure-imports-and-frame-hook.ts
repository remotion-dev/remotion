import type {
	ArrowFunctionExpression,
	File,
	FunctionDeclaration,
	FunctionExpression,
	ImportDeclaration,
	ImportSpecifier,
} from '@babel/types';
import * as recast from 'recast';

const b = recast.types.builders;
const n = recast.types.namedTypes;

type FunctionNode =
	| FunctionDeclaration
	| FunctionExpression
	| ArrowFunctionExpression;

const isFunctionNode = (value: unknown): value is FunctionNode => {
	return (
		n.FunctionDeclaration.check(value) ||
		n.FunctionExpression.check(value) ||
		n.ArrowFunctionExpression.check(value)
	);
};

export const findEnclosingFunctionPath = (
	path: recast.types.NodePath,
): recast.types.NodePath | null => {
	let current: recast.types.NodePath | null = path.parentPath;
	while (current) {
		if (isFunctionNode(current.value)) {
			return current;
		}

		current = current.parentPath;
	}

	return null;
};

const findRemotionImport = (ast: File): ImportDeclaration | null => {
	for (const stmt of ast.program.body) {
		if (
			stmt.type === 'ImportDeclaration' &&
			stmt.source.type === 'StringLiteral' &&
			stmt.source.value === 'remotion'
		) {
			return stmt;
		}
	}

	return null;
};

const insertImportDeclaration = (
	ast: File,
	importDecl: ImportDeclaration,
): void => {
	const body = ast.program.body;
	let lastImportIndex = -1;
	for (let i = 0; i < body.length; i++) {
		if (body[i].type === 'ImportDeclaration') {
			lastImportIndex = i;
		}
	}

	body.splice(lastImportIndex + 1, 0, importDecl);
};

export const ensureRemotionImports = (
	ast: File,
	names: ReadonlySet<string>,
): void => {
	if (names.size === 0) {
		return;
	}

	let remotionImport = findRemotionImport(ast);
	if (!remotionImport) {
		remotionImport = b.importDeclaration(
			[],
			b.stringLiteral('remotion'),
		) as unknown as ImportDeclaration;
		insertImportDeclaration(ast, remotionImport);
	}

	const existingNames = new Set<string>();
	for (const specifier of remotionImport.specifiers ?? []) {
		if (specifier.type !== 'ImportSpecifier') {
			continue;
		}

		const imported = (specifier as ImportSpecifier).imported;
		if (imported.type === 'Identifier') {
			existingNames.add(imported.name);
		} else if (imported.type === 'StringLiteral') {
			existingNames.add(imported.value);
		}
	}

	for (const name of names) {
		if (existingNames.has(name)) {
			continue;
		}

		remotionImport.specifiers = remotionImport.specifiers ?? [];
		remotionImport.specifiers.push(
			b.importSpecifier(b.identifier(name)) as unknown as ImportSpecifier,
		);
		existingNames.add(name);
	}
};

const componentBodyHasFrameDeclaration = (
	body: FunctionNode['body'],
): boolean => {
	if (!n.BlockStatement.check(body)) {
		return false;
	}

	for (const stmt of body.body) {
		if (stmt.type !== 'VariableDeclaration') {
			continue;
		}

		for (const decl of stmt.declarations) {
			if (decl.type !== 'VariableDeclarator') {
				continue;
			}

			if (
				decl.id.type === 'Identifier' &&
				decl.id.name === 'frame' &&
				decl.init &&
				decl.init.type === 'CallExpression' &&
				decl.init.callee.type === 'Identifier' &&
				decl.init.callee.name === 'useCurrentFrame'
			) {
				return true;
			}
		}
	}

	return false;
};

export const ensureUseCurrentFrameHook = (
	functionPath: recast.types.NodePath,
): void => {
	const fn = functionPath.value as FunctionNode;

	if (!n.BlockStatement.check(fn.body)) {
		// Arrow function with expression body: wrap the expression in a block so
		// we can prepend the hook call before returning the original expression.
		const expression = fn.body;
		fn.body = b.blockStatement([
			b.returnStatement(expression as Parameters<typeof b.returnStatement>[0]),
		]) as unknown as FunctionNode['body'];
	}

	if (componentBodyHasFrameDeclaration(fn.body)) {
		return;
	}

	const block = fn.body as Extract<
		FunctionNode['body'],
		{type: 'BlockStatement'}
	>;
	const frameDecl = b.variableDeclaration('const', [
		b.variableDeclarator(
			b.identifier('frame'),
			b.callExpression(b.identifier('useCurrentFrame'), []),
		),
	]);

	block.body.unshift(frameDecl as unknown as (typeof block.body)[number]);
};

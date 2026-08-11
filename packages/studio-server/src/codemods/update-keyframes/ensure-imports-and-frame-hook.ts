import type {
	ArrowFunctionExpression,
	File,
	FunctionDeclaration,
	FunctionExpression,
} from '@babel/types';
import * as recast from 'recast';
import {ensureNamedImports} from '../../helpers/imports';

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

export const ensureRemotionImports = (
	ast: File,
	names: ReadonlySet<string>,
) => {
	ensureNamedImports({ast, importedNames: names, sourcePath: 'remotion'});
};

const componentBodyHasFrameDeclaration = ({
	body,
	hookName,
}: {
	body: FunctionNode['body'];
	hookName: string;
}): boolean => {
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
				decl.init.callee.name === hookName
			) {
				return true;
			}
		}
	}

	return false;
};

export const ensureUseCurrentFrameHook = (
	functionPath: recast.types.NodePath,
	hookName = 'useCurrentFrame',
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

	if (componentBodyHasFrameDeclaration({body: fn.body, hookName})) {
		return;
	}

	const block = fn.body as Extract<
		FunctionNode['body'],
		{type: 'BlockStatement'}
	>;
	const frameDecl = b.variableDeclaration('const', [
		b.variableDeclarator(
			b.identifier('frame'),
			b.callExpression(b.identifier(hookName), []),
		),
	]);

	block.body.unshift(frameDecl as unknown as (typeof block.body)[number]);
};

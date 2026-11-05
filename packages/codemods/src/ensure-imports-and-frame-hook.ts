import type {
	ArrowFunctionExpression,
	File,
	FunctionDeclaration,
	FunctionExpression,
} from '@babel/types';
import * as recast from 'recast';
import {ensureNamedImports} from './sequence-props/imports';

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

export const isComponentFunctionPath = (path: recast.types.NodePath) => {
	if (!isFunctionNode(path.value)) {
		return false;
	}

	let argument = path;
	let parent = path.parentPath;
	while (
		parent &&
		(parent.value.type === 'TSAsExpression' ||
			parent.value.type === 'TSSatisfiesExpression' ||
			parent.value.type === 'TSNonNullExpression' ||
			parent.value.type === 'ParenthesizedExpression')
	) {
		argument = parent;
		parent = parent.parentPath;
	}

	while (parent && Array.isArray(parent.value)) {
		parent = parent.parentPath;
	}

	const owner = parent?.value;
	return !(
		owner?.type === 'CallExpression' &&
		owner.arguments.includes(argument.value) &&
		owner.callee.type === 'MemberExpression' &&
		!owner.callee.computed &&
		(owner.callee.property.name === 'map' ||
			owner.callee.property.name === 'flatMap')
	);
};

export const findEnclosingFunctionPath = (
	path: recast.types.NodePath,
): recast.types.NodePath | null => {
	let current: recast.types.NodePath | null = path.parentPath;
	while (current) {
		if (isComponentFunctionPath(current)) {
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

export const ensureUseCurrentFrameHook = ({
	referencePath,
	hookName,
}: {
	referencePath: recast.types.NodePath;
	hookName: string;
}): string => {
	const functionPath = findEnclosingFunctionPath(referencePath);
	if (!functionPath) {
		throw new Error(
			'Cannot add keyframes outside a component function because useCurrentFrame() needs a function scope',
		);
	}

	const fn = functionPath.value as FunctionNode;
	if (n.BlockStatement.check(fn.body)) {
		for (const statement of fn.body.body) {
			if (statement.type !== 'VariableDeclaration') {
				continue;
			}

			for (const declaration of statement.declarations) {
				if (
					declaration.type !== 'VariableDeclarator' ||
					declaration.id.type !== 'Identifier' ||
					declaration.init?.type !== 'CallExpression' ||
					declaration.init.callee.type !== 'Identifier' ||
					declaration.init.callee.name !== hookName
				) {
					continue;
				}

				const existingFrameName = declaration.id.name;
				let shadowed = false;
				const checkPattern = (
					pattern: Parameters<typeof recast.types.visit>[0],
				) => {
					recast.types.visit(pattern, {
						visitIdentifier(path) {
							if (path.node.name === existingFrameName) {
								shadowed = true;
							}

							return false;
						},
					});
				};

				recast.types.visit(fn, {
					visitVariableDeclarator(path) {
						if (path.node !== declaration) {
							checkPattern(path.node.id);
						}

						return this.traverse(path);
					},
					visitFunction(path) {
						if (path.node.id) {
							checkPattern(path.node.id);
						}

						for (const param of path.node.params) {
							checkPattern(param);
						}

						return this.traverse(path);
					},
					visitClassDeclaration(path) {
						if (path.node.id) {
							checkPattern(path.node.id);
						}

						return this.traverse(path);
					},
					visitCatchClause(path) {
						if (path.node.param) {
							checkPattern(path.node.param);
						}

						return this.traverse(path);
					},
				});

				if (!shadowed) {
					return declaration.id.name;
				}
			}
		}
	}

	const usedNames = new Set([hookName]);
	recast.types.visit(fn, {
		visitIdentifier(path) {
			usedNames.add(path.node.name);
			return false;
		},
	});
	let frameName = 'frame';
	let suffix = 2;
	while (usedNames.has(frameName) || referencePath.scope.lookup(frameName)) {
		frameName = `frame${suffix++}`;
	}

	if (!n.BlockStatement.check(fn.body)) {
		fn.body = b.blockStatement([
			b.returnStatement(fn.body as Parameters<typeof b.returnStatement>[0]),
		]) as unknown as FunctionNode['body'];
	}

	const block = fn.body as Extract<
		FunctionNode['body'],
		{type: 'BlockStatement'}
	>;
	block.body.unshift(
		b.variableDeclaration('const', [
			b.variableDeclarator(
				b.identifier(frameName),
				b.callExpression(b.identifier(hookName), []),
			),
		]) as unknown as (typeof block.body)[number],
	);
	return frameName;
};

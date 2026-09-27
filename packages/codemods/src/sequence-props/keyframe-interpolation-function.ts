import type {File, Identifier} from '@babel/types';
import {
	isKeyframeInterpolationFunction,
	type KeyframeInterpolationFunction,
} from '@remotion/studio-shared/keyframe-interpolation-function';
import * as recast from 'recast';
import {getImportedName} from './imports';

export const getKeyframeInterpolationFunctionForCallee = ({
	ast,
	callee,
}: {
	ast: File;
	callee: Identifier;
}): KeyframeInterpolationFunction | null => {
	let bindings: recast.types.NodePath[] | null = null;
	recast.types.visit(ast, {
		visitIdentifier(path) {
			if (path.node !== callee) {
				return this.traverse(path);
			}

			bindings =
				path.scope?.lookup(callee.name)?.getBindings()[callee.name] ?? null;
			this.abort();
			return false;
		},
	});
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.importKind === 'type'
		) {
			continue;
		}

		for (const specifier of statement.specifiers) {
			if (
				specifier.local.name !== callee.name ||
				(specifier.type === 'ImportSpecifier' &&
					specifier.importKind === 'type')
			) {
				continue;
			}

			if (specifier.type !== 'ImportSpecifier') {
				return null;
			}

			if (
				bindings !== null &&
				!(bindings as recast.types.NodePath[]).some(
					(binding) => binding.node === specifier.local,
				)
			) {
				return null;
			}

			const importedName = getImportedName(specifier);
			if (
				isKeyframeInterpolationFunction(importedName) &&
				statement.source.value ===
					(importedName === 'interpolatePaths' ? '@remotion/paths' : 'remotion')
			) {
				return importedName;
			}

			return null;
		}
	}

	return bindings === null && isKeyframeInterpolationFunction(callee.name)
		? callee.name
		: null;
};

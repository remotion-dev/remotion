import type {Expression, File, Identifier, Node} from '@babel/types';
import * as recast from 'recast';
import type {
	CanUpdateSequencePropsResponseTrue,
	SourceNumericValue,
	SequenceNodePath,
} from 'remotion';
import {
	findJsxElementPathAtNodePath,
	getNodePathForRecastPath,
} from '../sequence-props';
import {getReadOnlySourceSnapshot} from '../sequence-props-snapshot';
import {getKeyframeInterpolationFunctionForCallee} from './keyframe-interpolation-function';
import {parseVideoConfigNumericExpression} from './video-config-numeric-expression';
import {getVideoConfigIdentifiers} from './video-config-values';
import type {VideoConfigIdentifierValues} from './video-config-values';

type DurationDependentKeyframes = NonNullable<
	CanUpdateSequencePropsResponseTrue['durationDependentKeyframes']
>;
const cache = new WeakMap<object, DurationDependentKeyframes | null>();
const functionTypes = new Set([
	'FunctionDeclaration',
	'FunctionExpression',
	'ArrowFunctionExpression',
]);

const getConstantInitializer = (
	path: recast.types.NodePath,
): recast.types.NodePath | null => {
	const node = path.node as Node;
	if (node.type !== 'Identifier') return null;
	const binding = path.scope.lookup(node.name)?.getBindings()[node.name]?.[0];
	const declaration = binding?.parentPath;
	return declaration?.node.type === 'VariableDeclarator' &&
		declaration.node.id === binding.node &&
		declaration.parentPath.node.kind === 'const' &&
		declaration.node.init
		? declaration.get('init')
		: null;
};

const parseFrame = (
	path: recast.types.NodePath,
	bindings: VideoConfigIdentifierValues,
	seen: Set<object>,
): SourceNumericValue | null => {
	const node = path.node as Expression;
	if (!node || seen.has(node)) return null;
	const nextSeen = new Set(seen).add(node);
	const parsed = parseVideoConfigNumericExpression({
		node,
		videoConfigValues: bindings,
	});
	if (parsed) return parsed;
	const initializer = getConstantInitializer(path);
	if (initializer) return parseFrame(initializer, bindings, nextSeen);
	if (node.type === 'TSAsExpression')
		return parseFrame(path.get('expression'), bindings, nextSeen);
	if (
		node.type === 'BinaryExpression' &&
		['+', '-', '*', '/'].includes(node.operator)
	) {
		const left = parseFrame(path.get('left'), bindings, nextSeen);
		const right = parseFrame(path.get('right'), bindings, nextSeen);
		return left !== null && right !== null
			? {
					type: 'binary',
					operator: node.operator as '+' | '-' | '*' | '/',
					left,
					right,
				}
			: null;
	}

	return null;
};

export const getDurationDependentKeyframes = ({
	ast,
	jsxPath,
	videoConfigIdentifierValues,
}: {
	ast: File;
	jsxPath: recast.types.NodePath;
	videoConfigIdentifierValues: VideoConfigIdentifierValues;
}): DurationDependentKeyframes | null => {
	let scopePath: recast.types.NodePath | null = jsxPath;
	while (scopePath && !functionTypes.has((scopePath.node as Node).type)) {
		scopePath = scopePath.parentPath;
	}

	if (!scopePath) return null;
	const scopeNode = scopePath.node as Node;
	if (cache.has(scopeNode)) return cache.get(scopeNode)!;
	const inputRanges: (SourceNumericValue[] | null)[] = [];
	// Inspect the whole render scope, including variables, effects, and ordinary
	// JSX children with no editable schema. Source snapshots cache this per scope.
	recast.types.visit(scopePath as unknown as Node, {
		visitCallExpression(path) {
			const {callee} = path.node;
			if (
				callee.type !== 'Identifier' ||
				!path.node.arguments[1] ||
				getKeyframeInterpolationFunctionForCallee({
					ast,
					callee: callee as Identifier,
				}) === null
			) {
				return this.traverse(path);
			}

			let dependsOnDuration = false;
			const pending = [path.get('arguments', 1)];
			const seen = new Set<object>();
			while (pending.length > 0) {
				const rangePath = pending.pop()!;
				if (seen.has(rangePath.node as Node)) continue;
				seen.add(rangePath.node as Node);
				recast.types.visit(rangePath as unknown as Node, {
					visitIdentifier(identifierPath) {
						const binding =
							videoConfigIdentifierValues instanceof Map
								? videoConfigIdentifierValues.get(
										identifierPath.node as Identifier,
									)
								: videoConfigIdentifierValues[identifierPath.node.name];
						if (
							binding?.type === 'video-config' &&
							binding.field === 'durationInFrames'
						) {
							const declaration = identifierPath.scope
								.lookup(identifierPath.node.name)
								?.getBindings()[identifierPath.node.name]?.[0];
							let owner = declaration?.parentPath;
							while (
								owner &&
								owner.node !== scopeNode &&
								!functionTypes.has(owner.node.type)
							) {
								owner = owner.parentPath;
							}

							// A nested component's hook has an independent duration.
							dependsOnDuration ||= owner?.node === scopeNode;
						} else {
							const initializer = getConstantInitializer(
								identifierPath as unknown as recast.types.NodePath,
							);
							if (initializer) pending.push(initializer);
						}

						return false;
					},
				});
			}

			if (dependsOnDuration) {
				let rangePath = path.get('arguments', 1);
				const seenRanges = new Set<object>();
				while (!seenRanges.has(rangePath.node as Node)) {
					seenRanges.add(rangePath.node as Node);
					const initializer = getConstantInitializer(rangePath);
					if (!initializer) break;
					rangePath = initializer;
				}

				const range = rangePath.node as Node;
				const expressions =
					range.type === 'ArrayExpression'
						? range.elements.map((_, index) =>
								parseFrame(
									rangePath.get('elements', index),
									videoConfigIdentifierValues,
									new Set(),
								),
							)
						: null;
				// Unknown duration arithmetic must not become an unsafe trim.
				inputRanges.push(
					expressions?.every((value) => value !== null) ? expressions : null,
				);
			}

			return this.traverse(path);
		},
	});
	const result =
		inputRanges.length > 0
			? {scope: getNodePathForRecastPath(scopePath, ast), inputRanges}
			: null;
	cache.set(scopeNode, result);
	return result;
};

// Kept separate from prop subscriptions: scanning the render scope is only
// needed when a timing edit begins.
export const getDurationDependentKeyframesFromContent = ({
	fileContents,
	nodePath,
}: {
	fileContents: string;
	nodePath: SequenceNodePath;
}): DurationDependentKeyframes | null => {
	const snapshot = getReadOnlySourceSnapshot(fileContents);
	const jsxPath = findJsxElementPathAtNodePath(snapshot.ast, nodePath);
	if (!jsxPath)
		throw new Error('Could not find the sequence to check keyframes');
	const videoConfigIdentifierValues =
		snapshot.videoConfigIdentifierValues ??
		getVideoConfigIdentifiers({ast: snapshot.ast});
	snapshot.videoConfigIdentifierValues = videoConfigIdentifierValues;
	return getDurationDependentKeyframes({
		ast: snapshot.ast,
		jsxPath,
		videoConfigIdentifierValues,
	});
};

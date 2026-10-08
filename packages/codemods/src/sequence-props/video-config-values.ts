import type {File, Identifier} from '@babel/types';
import * as recast from 'recast';
import type {VideoConfigNumericBinding, VideoConfigValues} from 'remotion';

export type VideoConfigIdentifierValues =
	| Map<Identifier, VideoConfigNumericBinding>
	| Record<string, VideoConfigNumericBinding>;

export const getVideoConfigIdentifiers = ({
	ast,
}: {
	ast: File;
}): Map<Identifier, VideoConfigNumericBinding> => {
	const candidates = new Map<Identifier, VideoConfigNumericBinding>();

	recast.types.visit(ast, {
		visitVariableDeclarator(path) {
			const {id, init} = path.node;
			const isVideoConfigDeclaration =
				id.type === 'ObjectPattern' &&
				init?.type === 'CallExpression' &&
				init.callee.type === 'Identifier' &&
				init.callee.name === 'useVideoConfig' &&
				init.arguments.length === 0;

			if (isVideoConfigDeclaration) {
				for (const property of id.properties) {
					if (
						property.type !== 'ObjectProperty' ||
						property.computed ||
						property.value.type !== 'Identifier'
					) {
						continue;
					}

					const configKey =
						property.key.type === 'Identifier'
							? property.key.name
							: property.key.type === 'StringLiteral'
								? property.key.value
								: null;
					if (
						configKey !== 'durationInFrames' &&
						configKey !== 'fps' &&
						configKey !== 'width' &&
						configKey !== 'height'
					) {
						continue;
					}

					candidates.set(property.value as Identifier, {
						type: 'video-config',
						field: configKey,
					});
				}
			} else if (id.type === 'Identifier') {
				const declaration = path.parentPath.node;
				const numericConstant =
					declaration.type === 'VariableDeclaration' &&
					declaration.kind === 'const' &&
					init?.type === 'NumericLiteral' &&
					Number.isFinite(init.value)
						? init.value
						: null;

				if (numericConstant !== null) {
					candidates.set(id as Identifier, {
						type: 'constant',
						value: numericConstant,
					});
				}
			}

			this.traverse(path);
		},
	});

	// Resolve each reference to its declaration. Components may independently
	// declare the same name, while parameters and other shadowing stay computed.
	const bindings = new Map<Identifier, VideoConfigNumericBinding>();
	recast.types.visit(ast, {
		visitIdentifier(path) {
			const declarations =
				path.scope.lookup(path.node.name)?.getBindings()[path.node.name] ?? [];
			if (declarations.length === 1) {
				const binding = candidates.get(declarations[0].node as Identifier);
				if (binding !== undefined) {
					bindings.set(path.node as Identifier, binding);
				}
			}

			this.traverse(path);
		},
	});

	return bindings;
};

// Editing uses the current instance's configuration supplied with the mutation.
export const getVideoConfigIdentifierValues = ({
	ast,
	videoConfigValues,
}: {
	ast: File;
	videoConfigValues: VideoConfigValues | null;
}): VideoConfigIdentifierValues =>
	new Map(
		[...getVideoConfigIdentifiers({ast})].flatMap(([identifier, binding]) => {
			if (binding.type === 'constant') return [[identifier, binding]];
			const value = videoConfigValues?.[binding.field];
			return value === undefined || !Number.isFinite(value)
				? []
				: [[identifier, {type: 'constant', value}]];
		}),
	);

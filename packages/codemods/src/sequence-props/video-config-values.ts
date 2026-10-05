import type {File} from '@babel/types';
import * as recast from 'recast';
import type {VideoConfigNumericBinding, VideoConfigValues} from 'remotion';

export type VideoConfigIdentifierValues = Record<
	string,
	VideoConfigNumericBinding
>;

export const getVideoConfigIdentifiers = ({
	ast,
}: {
	ast: File;
}): VideoConfigIdentifierValues => {
	const candidates = new Map<string, VideoConfigNumericBinding>();
	const otherDeclarations = new Set<string>();
	const addCandidate = (
		identifier: string,
		value: VideoConfigNumericBinding,
	) => {
		if (candidates.has(identifier) || otherDeclarations.has(identifier)) {
			candidates.delete(identifier);
			otherDeclarations.add(identifier);
			return;
		}

		candidates.set(identifier, value);
	};

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

					addCandidate(property.value.name, {
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
					addCandidate(id.name, {type: 'constant', value: numericConstant});
				} else {
					candidates.delete(id.name);
					otherDeclarations.add(id.name);
				}
			}

			this.traverse(path);
		},
	});

	for (const identifier of otherDeclarations) {
		candidates.delete(identifier);
	}

	return Object.fromEntries(candidates);
};

// Editing uses the current instance's configuration supplied with the mutation.
export const getVideoConfigIdentifierValues = ({
	ast,
	videoConfigValues,
}: {
	ast: File;
	videoConfigValues: VideoConfigValues | null;
}): VideoConfigIdentifierValues =>
	Object.fromEntries(
		Object.entries(getVideoConfigIdentifiers({ast})).flatMap(
			([identifier, binding]) => {
				if (binding.type === 'constant') return [[identifier, binding]];
				const value = videoConfigValues?.[binding.field];
				return value === undefined || !Number.isFinite(value)
					? []
					: [[identifier, {type: 'constant', value}]];
			},
		),
	);

import type {File} from '@babel/types';
import * as recast from 'recast';
import type {VideoConfigValues} from 'remotion';

export type VideoConfigIdentifierValues = Record<string, number>;

export const getVideoConfigIdentifierValues = ({
	ast,
	videoConfigValues,
}: {
	ast: File;
	videoConfigValues: VideoConfigValues | null;
}): VideoConfigIdentifierValues => {
	const candidates = new Map<string, number>();
	const otherDeclarations = new Set<string>();
	const addCandidate = (identifier: string, value: number) => {
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
				videoConfigValues !== null &&
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
					if (configKey === null || !(configKey in videoConfigValues)) {
						continue;
					}

					const value = videoConfigValues[configKey as keyof VideoConfigValues];
					if (Number.isFinite(value)) {
						addCandidate(property.value.name, value);
					}
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
					addCandidate(id.name, numericConstant);
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

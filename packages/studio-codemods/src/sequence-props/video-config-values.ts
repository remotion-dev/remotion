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
	if (videoConfigValues === null) {
		return {};
	}

	const candidates = new Map<string, number>();
	const otherDeclarations = new Set<string>();

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
					if (configKey === null || !(configKey in videoConfigValues)) {
						continue;
					}

					const value = videoConfigValues[configKey as keyof VideoConfigValues];
					if (Number.isFinite(value)) {
						candidates.set(property.value.name, value);
					}
				}
			} else if (id.type === 'Identifier') {
				otherDeclarations.add(id.name);
			}

			this.traverse(path);
		},
	});

	for (const identifier of otherDeclarations) {
		candidates.delete(identifier);
	}

	return Object.fromEntries(candidates);
};

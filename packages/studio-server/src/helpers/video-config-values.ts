import type {Expression, File} from '@babel/types';
import type {VideoConfigValues} from '@remotion/studio-shared';
import * as recast from 'recast';

type NodeLike = {
	type: string;
	name: string | null;
	value: unknown | null;
};

type BindingPatternLike = NodeLike & {
	argument: BindingPatternLike | null;
	left: BindingPatternLike | null;
	elements: (BindingPatternLike | null)[] | null;
	properties: BindingPropertyLike[] | null;
};

type BindingPropertyLike =
	| {
			type: 'ObjectProperty';
			computed: boolean | null;
			key: NodeLike;
			value: BindingPatternLike;
	  }
	| {
			type: 'RestElement';
			argument: BindingPatternLike;
	  };

const isUseVideoConfigCall = (node: Expression | null | undefined): boolean => {
	return (
		node?.type === 'CallExpression' &&
		node.callee.type === 'Identifier' &&
		node.callee.name === 'useVideoConfig' &&
		node.arguments.length === 0
	);
};

const getObjectPropertyName = (
	property: Extract<BindingPropertyLike, {type: 'ObjectProperty'}>,
): string | null => {
	if (property.computed === true) {
		return null;
	}

	if (property.key.type === 'Identifier') {
		return property.key.name ?? null;
	}

	if (
		property.key.type === 'StringLiteral' ||
		property.key.type === 'NumericLiteral'
	) {
		return String(property.key.value);
	}

	return null;
};

const collectDeclaredIdentifiers = (
	node: BindingPatternLike,
	identifiers: Set<string>,
) => {
	if (node.type === 'Identifier') {
		const name = node.name ?? null;
		if (name !== null) {
			identifiers.add(name);
		}

		return;
	}

	if (node.type === 'RestElement') {
		const argument = node.argument ?? null;
		if (argument !== null) {
			collectDeclaredIdentifiers(argument, identifiers);
		}

		return;
	}

	if (node.type === 'AssignmentPattern') {
		const left = node.left ?? null;
		if (left !== null) {
			collectDeclaredIdentifiers(left, identifiers);
		}

		return;
	}

	if (node.type === 'ArrayPattern') {
		for (const element of node.elements ?? []) {
			if (element !== null) {
				collectDeclaredIdentifiers(element, identifiers);
			}
		}

		return;
	}

	if (node.type === 'ObjectPattern') {
		for (const property of node.properties ?? []) {
			if (property.type === 'ObjectProperty') {
				collectDeclaredIdentifiers(property.value, identifiers);
			}

			if (property.type === 'RestElement') {
				collectDeclaredIdentifiers(property.argument, identifiers);
			}
		}
	}
};

export const getVideoConfigValuesForAst = ({
	ast,
	videoConfigValues,
}: {
	ast: File;
	videoConfigValues: VideoConfigValues;
}): VideoConfigValues => {
	const values: VideoConfigValues = {};
	const conflictingDeclarations = new Set<string>();

	recast.types.visit(ast, {
		visitVariableDeclarator(path) {
			const id = path.node.id as BindingPatternLike;
			const init = path.node.init as Expression | null;
			if (
				isUseVideoConfigCall(init as Expression | null) &&
				id.type === 'ObjectPattern'
			) {
				for (const property of id.properties ?? []) {
					if (property.type !== 'ObjectProperty') {
						continue;
					}

					const sourceName = getObjectPropertyName(property);
					const target = property.value;
					const targetName = target.name ?? null;
					if (
						sourceName === null ||
						target.type !== 'Identifier' ||
						targetName === null
					) {
						continue;
					}

					const videoConfigValue = videoConfigValues[sourceName];
					if (
						typeof videoConfigValue === 'number' &&
						Number.isFinite(videoConfigValue)
					) {
						values[targetName] = videoConfigValue;
					}
				}

				return this.traverse(path);
			}

			collectDeclaredIdentifiers(id, conflictingDeclarations);
			return this.traverse(path);
		},
	});

	for (const identifier of conflictingDeclarations) {
		delete values[identifier];
	}

	return values;
};

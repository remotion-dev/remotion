import type {Expression, File} from '@babel/types';
import type {RuntimeIdentifierValues} from '@remotion/studio-shared';
import * as recast from 'recast';

type NodeLike = {
	type: string;
	name?: string;
	value?: unknown;
};

type BindingPatternLike = NodeLike & {
	argument?: BindingPatternLike;
	left?: BindingPatternLike;
	elements?: (BindingPatternLike | null)[];
	properties?: BindingPropertyLike[];
};

type BindingPropertyLike =
	| {
			type: 'ObjectProperty';
			computed?: boolean;
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
	if (property.computed) {
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
		if (node.name) {
			identifiers.add(node.name);
		}

		return;
	}

	if (node.type === 'RestElement') {
		if (node.argument) {
			collectDeclaredIdentifiers(node.argument, identifiers);
		}

		return;
	}

	if (node.type === 'AssignmentPattern') {
		if (node.left) {
			collectDeclaredIdentifiers(node.left, identifiers);
		}

		return;
	}

	if (node.type === 'ArrayPattern') {
		for (const element of node.elements ?? []) {
			if (element) {
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

export const getRuntimeIdentifierValuesForAst = ({
	ast,
	runtimeIdentifierValues,
}: {
	ast: File;
	runtimeIdentifierValues: RuntimeIdentifierValues;
}): RuntimeIdentifierValues => {
	const values: RuntimeIdentifierValues = {};
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
					if (
						sourceName === null ||
						target.type !== 'Identifier' ||
						!target.name
					) {
						continue;
					}

					const runtimeValue = runtimeIdentifierValues[sourceName];
					if (
						typeof runtimeValue === 'number' &&
						Number.isFinite(runtimeValue)
					) {
						values[target.name] = runtimeValue;
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

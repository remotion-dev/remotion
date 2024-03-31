import type {
	ArrowFunctionExpression,
	Declaration,
	Expression,
	File,
	JSXFragment,
	Statement,
	VariableDeclarator,
} from '@babel/types';
import type {RecastCodemod} from '@remotion/studio-shared';

export type Change = {
	description: string;
};

export const applyCodemod = ({
	file,
	codeMod,
}: {
	file: File;
	codeMod: RecastCodemod;
}): {newAst: File; changesMade: Change[]} => {
	const changesMade: Change[] = [];

	const body = file.program.body.map((node) => {
		return mapTopLevlNode(node, codeMod, changesMade);
	});

	return {
		newAst: {
			...file,
			program: {
				...file.program,
				body,
			},
		},
		changesMade,
	};
};

const mapTopLevlNode = (
	node: Statement,
	transformation: RecastCodemod,
	changesMade: Change[],
): Statement => {
	if (
		// TODO: could also be a default export
		node.type !== 'ExportNamedDeclaration'
	) {
		return node;
	}

	if (!node.declaration) {
		return node;
	}

	// TODO: Could also be an anonymous function etc?
	if (node.declaration.type !== 'VariableDeclaration') {
		return node;
	}

	return {
		...node,
		declaration: mapDeclaration(node.declaration, transformation, changesMade),
	};
};

const mapDeclaration = (
	declaration: Declaration,
	transformation: RecastCodemod,
	changesMade: Change[],
): Declaration => {
	if (declaration.type !== 'VariableDeclaration') {
		return declaration;
	}

	const declarations = declaration.declarations.map((d) => {
		return mapVariableDeclarator(d, transformation, changesMade);
	});
	return {...declaration, declarations};
};

const mapVariableDeclarator = (
	variableDeclarator: VariableDeclarator,
	transformation: RecastCodemod,
	changesMade: Change[],
): VariableDeclarator => {
	return {
		...variableDeclarator,
		init: variableDeclarator.init
			? mapExpression(variableDeclarator.init, transformation, changesMade)
			: variableDeclarator.init,
	};
};

const mapExpression = (
	expression: Expression,
	transformation: RecastCodemod,
	changesMade: Change[],
) => {
	// TODO: This could definitely be a different type
	if (expression.type !== 'ArrowFunctionExpression') {
		return expression;
	}

	return mapArrowFunctionExpression(expression, transformation, changesMade);
};

const mapArrowFunctionExpression = (
	arrowFunctionExpression: ArrowFunctionExpression,
	transformation: RecastCodemod,
	changesMade: Change[],
): ArrowFunctionExpression => {
	const {body} = arrowFunctionExpression;

	if (body.type !== 'BlockStatement') {
		return arrowFunctionExpression;
	}

	return {
		...arrowFunctionExpression,
		body: {
			...body,
			body: body.body.map((a) => {
				return mapBodyStatement(a, transformation, changesMade);
			}),
		},
	};
};

const mapBodyStatement = (
	statement: Statement,
	transformation: RecastCodemod,
	changesMade: Change[],
): Statement => {
	if (statement.type !== 'ReturnStatement') {
		return statement;
	}

	const argument = statement.argument as Expression;
	if (argument.type !== 'JSXFragment') {
		return statement;
	}

	return {
		...statement,
		argument: mapJsxFragment(argument, transformation, changesMade),
	};
};

const mapJsxFragment = (
	jsxFragment: JSXFragment,
	transformation: RecastCodemod,
	changesMade: Change[],
): JSXFragment => {
	return {
		...jsxFragment,
		children: jsxFragment.children
			.map((c) => mapJsxChild(c, transformation, changesMade))
			.flat(1),
	};
};

const mapJsxChild = (
	c: JSXFragment['children'][number],
	transformation: RecastCodemod | null,
	changesMade: Change[],
): JSXFragment['children'][number][] => {
	const compId = getCompositionIdFromJSXElement(c);

	if (transformation === null) {
		return [c];
	}

	if (
		transformation.type === 'duplicate-composition' &&
		compId === transformation.idToDuplicate
	) {
		return [
			c,
			changeCompositionIdInJSXElement({
				jsxElement: c,
				newCompositionId: transformation.newId,
				newCompositionFps: transformation.newFps,
				newCompositionDurationInFrames: transformation.newDurationInFrames,
				newCompositionHeight: transformation.newHeight,
				newCompositionWidth: transformation.newWidth,
				changesMade,
			}),
		];
	}

	if (
		transformation.type === 'rename-composition' &&
		compId === transformation.idToRename
	) {
		return [
			changeCompositionIdInJSXElement({
				jsxElement: c,
				newCompositionId: transformation.newId,
				newCompositionFps: null,
				newCompositionDurationInFrames: null,
				newCompositionHeight: null,
				newCompositionWidth: null,
				changesMade,
			}),
		];
	}

	if (
		transformation.type === 'delete-composition' &&
		compId === transformation.idToDelete
	) {
		changesMade.push({
			description: 'Deleted composition',
		});
		return [];
	}

	if (c.type === 'JSXElement') {
		return [
			{
				...c,
				children: c.children
					.map((childOfChild) =>
						mapJsxChild(childOfChild, transformation, changesMade),
					)
					.flat(1),
			},
		];
	}

	return [c];
};

const getCompositionIdFromJSXElement = (
	jsxElement: JSXFragment['children'][number],
) => {
	if (jsxElement.type !== 'JSXElement') {
		return null;
	}

	const {openingElement} = jsxElement;
	const {name} = openingElement;
	// TODO: There is also JSXMemberExpression | JSXNamespacedName,
	// could these be in a composition as well
	if (name.type !== 'JSXIdentifier') {
		return null;
	}

	if (name.name !== 'Composition' && name.name !== 'Still') {
		return null;
	}

	const id = openingElement.attributes
		.map((attribute) => {
			if (attribute.type === 'JSXSpreadAttribute') {
				return null;
			}

			if (attribute.name.type === 'JSXNamespacedName') {
				return null;
			}

			if (attribute.name.name !== 'id') {
				return null;
			}

			if (!attribute.value) {
				return null;
			}

			// TODO: At least JSX
			if (attribute.value.type === 'StringLiteral') {
				return attribute.value.value;
			}

			return null;
		})
		.filter(Boolean);

	return id[0];
};

const changeCompositionIdInJSXElement = ({
	jsxElement,
	newCompositionId,
	newCompositionFps,
	newCompositionDurationInFrames,
	newCompositionHeight,
	newCompositionWidth,
	changesMade,
}: {
	jsxElement: JSXFragment['children'][number];
	newCompositionId: string;
	newCompositionFps: number | null;
	newCompositionDurationInFrames: number | null;
	newCompositionHeight: number | null;
	newCompositionWidth: number | null;
	changesMade: Change[];
}): JSXFragment['children'][number] => {
	if (jsxElement.type !== 'JSXElement') {
		return jsxElement;
	}

	const {openingElement} = jsxElement;
	const {name} = openingElement;
	// TODO: There is also JSXMemberExpression | JSXNamespacedName,
	// could these be in a composition as well
	if (name.type !== 'JSXIdentifier') {
		return jsxElement;
	}

	if (name.name !== 'Composition') {
		return jsxElement;
	}

	const attributes = openingElement.attributes.map((attribute) => {
		if (attribute.type === 'JSXSpreadAttribute') {
			return attribute;
		}

		if (attribute.name.type === 'JSXNamespacedName') {
			return attribute;
		}

		// TODO: Support JSX
		if (
			attribute.name.name === 'id' &&
			attribute.value &&
			attribute.value.type === 'StringLiteral'
		) {
			changesMade.push({
				description: 'Replaced composition id',
			});

			return {
				...attribute,
				value: {...attribute.value, value: newCompositionId},
			};
		}

		if (
			attribute.name.name === 'fps' &&
			attribute.value &&
			attribute.value.type === 'JSXExpressionContainer' &&
			attribute.value.expression.type === 'NumericLiteral' &&
			newCompositionFps !== null
		) {
			changesMade.push({
				description: 'Replaced FPS',
			});

			return {
				...attribute,
				value: {
					...attribute.value,
					expression: {...attribute.value.expression, value: newCompositionFps},
				},
			};
		}

		if (
			attribute.name.name === 'durationInFrames' &&
			attribute.value &&
			attribute.value.type === 'JSXExpressionContainer' &&
			attribute.value.expression.type === 'NumericLiteral' &&
			newCompositionDurationInFrames !== null
		) {
			changesMade.push({
				description: 'Replaced durationInFrames',
			});

			return {
				...attribute,
				value: {
					...attribute.value,
					expression: {
						...attribute.value.expression,
						value: newCompositionDurationInFrames,
					},
				},
			};
		}

		if (
			attribute.name.name === 'width' &&
			attribute.value &&
			attribute.value.type === 'JSXExpressionContainer' &&
			attribute.value.expression.type === 'NumericLiteral' &&
			newCompositionWidth !== null
		) {
			changesMade.push({
				description: 'Replaced width',
			});

			return {
				...attribute,
				value: {
					...attribute.value,
					expression: {
						...attribute.value.expression,
						value: newCompositionWidth,
					},
				},
			};
		}

		if (
			attribute.name.name === 'height' &&
			attribute.value &&
			attribute.value.type === 'JSXExpressionContainer' &&
			attribute.value.expression.type === 'NumericLiteral' &&
			newCompositionHeight !== null
		) {
			changesMade.push({
				description: 'Replaced height',
			});

			return {
				...attribute,
				value: {
					...attribute.value,
					expression: {
						...attribute.value.expression,
						value: newCompositionHeight,
					},
				},
			};
		}

		return attribute;
	});

	return {
		...jsxElement,
		openingElement: {
			...jsxElement.openingElement,
			attributes,
		},
	};
};

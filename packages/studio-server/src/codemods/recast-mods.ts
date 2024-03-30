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

export const applyCodemod = ({
	file,
	codeMod,
}: {
	file: File;
	codeMod: RecastCodemod;
}): File => {
	const body = file.program.body.map((node) => {
		return mapTopLevlNode(node, codeMod);
	});

	return {
		...file,
		program: {
			...file.program,
			body,
		},
	};
};

const mapTopLevlNode = (
	node: Statement,
	transformation: RecastCodemod,
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
		declaration: mapDeclaration(node.declaration, transformation),
	};
};

const mapDeclaration = (
	declaration: Declaration,
	transformation: RecastCodemod,
): Declaration => {
	if (declaration.type !== 'VariableDeclaration') {
		return declaration;
	}

	const declarations = declaration.declarations.map((d) => {
		return mapVariableDeclarator(d, transformation);
	});
	return {...declaration, declarations};
};

const mapVariableDeclarator = (
	variableDeclarator: VariableDeclarator,
	transformation: RecastCodemod,
): VariableDeclarator => {
	return {
		...variableDeclarator,
		init: variableDeclarator.init
			? mapExpression(variableDeclarator.init, transformation)
			: variableDeclarator.init,
	};
};

const mapExpression = (
	expression: Expression,
	transformation: RecastCodemod,
) => {
	// TODO: This could definitely be a different type
	if (expression.type !== 'ArrowFunctionExpression') {
		return expression;
	}

	return mapArrowFunctionExpression(expression, transformation);
};

const mapArrowFunctionExpression = (
	arrowFunctionExpression: ArrowFunctionExpression,
	transformation: RecastCodemod,
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
				return mapBodyStatement(a, transformation);
			}),
		},
	};
};

const mapBodyStatement = (
	statement: Statement,
	transformation: RecastCodemod,
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
		argument: mapJsxFragment(argument, transformation),
	};
};

const mapJsxFragment = (
	jsxFragment: JSXFragment,
	transformation: RecastCodemod,
): JSXFragment => {
	return {
		...jsxFragment,
		children: jsxFragment.children
			.map((c) => mapJsxChild(c, transformation))
			.flat(1),
	};
};

const mapJsxChild = (
	c: JSXFragment['children'][number],
	transformation: RecastCodemod | null,
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
			...mapJsxChild(c, null),
			changeCompositionIdInJSXElement(c, transformation.newId),
		];
	}

	if (
		transformation.type === 'rename-composition' &&
		compId === transformation.idToRename
	) {
		return [changeCompositionIdInJSXElement(c, transformation.newId)];
	}

	if (
		transformation.type === 'delete-composition' &&
		compId === transformation.idToDelete
	) {
		return [];
	}

	if (c.type === 'JSXElement') {
		return [
			{
				...c,
				children: c.children
					.map((childOfChild) => mapJsxChild(childOfChild, transformation))
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

	if (name.name !== 'Composition') {
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

const changeCompositionIdInJSXElement = (
	jsxElement: JSXFragment['children'][number],
	newCompositionId: string,
): JSXFragment['children'][number] => {
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

		if (attribute.name.name !== 'id') {
			return attribute;
		}

		if (!attribute.value) {
			return attribute;
		}

		// TODO: At least JSX
		if (attribute.value.type === 'StringLiteral') {
			return {
				...attribute,
				value: {...attribute.value, value: newCompositionId},
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

import type {File, Node} from '@babel/types';

export const getInteractiveComponent = ({
	ast,
	declaration,
}: {
	ast: File;
	declaration: Node;
}): Node | null => {
	let expression =
		declaration.type === 'VariableDeclarator' ? declaration.init : declaration;
	while (
		expression &&
		(expression.type === 'TSAsExpression' ||
			expression.type === 'TSSatisfiesExpression' ||
			expression.type === 'TypeCastExpression' ||
			expression.type === 'ParenthesizedExpression')
	) {
		expression = expression.expression;
	}

	if (
		expression?.type !== 'CallExpression' ||
		expression.callee.type !== 'MemberExpression' ||
		expression.callee.computed ||
		expression.callee.property.type !== 'Identifier' ||
		!['create', 'withSchema'].includes(expression.callee.property.name)
	) {
		return null;
	}

	const {object} = expression.callee;
	const isInteractive = ast.program.body.some((statement) => {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.source.value !== 'remotion' ||
			statement.importKind === 'type'
		) {
			return false;
		}

		return statement.specifiers.some((specifier) => {
			if (object.type === 'Identifier') {
				return (
					specifier.type === 'ImportSpecifier' &&
					specifier.imported.type === 'Identifier' &&
					specifier.imported.name === 'Interactive' &&
					specifier.local.name === object.name
				);
			}

			return (
				object.type === 'MemberExpression' &&
				!object.computed &&
				object.object.type === 'Identifier' &&
				object.property.type === 'Identifier' &&
				object.property.name === 'Interactive' &&
				specifier.type === 'ImportNamespaceSpecifier' &&
				specifier.local.name === object.object.name
			);
		});
	});
	const options = expression.arguments[0];
	if (!isInteractive || options?.type !== 'ObjectExpression') {
		return null;
	}

	const component = options.properties.find(
		(property) =>
			property.type === 'ObjectProperty' &&
			!property.computed &&
			((property.key.type === 'Identifier' &&
				property.key.name === 'Component') ||
				(property.key.type === 'StringLiteral' &&
					property.key.value === 'Component')),
	);

	return component?.type === 'ObjectProperty' ? component.value : null;
};

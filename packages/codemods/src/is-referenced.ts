import type {Node} from '@babel/types';

export const isReferenced = (
	node: Node,
	parent: Node,
	grandparent?: Node,
): boolean => {
	switch (parent.type) {
		case 'MemberExpression':
		case 'OptionalMemberExpression':
			return parent.property === node
				? Boolean(parent.computed)
				: parent.object === node;
		case 'JSXMemberExpression':
			return parent.object === node;
		case 'VariableDeclarator':
			return parent.init === node;
		case 'ArrowFunctionExpression':
			return parent.body === node;
		case 'PrivateName':
			return false;
		case 'ClassMethod':
		case 'ClassPrivateMethod':
		case 'ObjectMethod':
			return parent.key === node ? Boolean(parent.computed) : false;
		case 'ObjectProperty':
			return parent.key === node
				? parent.computed
				: grandparent?.type !== 'ObjectPattern';
		case 'ClassProperty':
		case 'ClassAccessorProperty':
			return parent.key === node ? Boolean(parent.computed) : true;
		case 'ClassPrivateProperty':
			return parent.key !== node;
		case 'ClassDeclaration':
		case 'ClassExpression':
			return parent.superClass === node;
		case 'AssignmentExpression':
		case 'AssignmentPattern':
			return parent.right === node;
		case 'LabeledStatement':
		case 'CatchClause':
		case 'RestElement':
		case 'BreakStatement':
		case 'ContinueStatement':
		case 'FunctionDeclaration':
		case 'FunctionExpression':
		case 'ExportNamespaceSpecifier':
		case 'ExportDefaultSpecifier':
		case 'ImportDefaultSpecifier':
		case 'ImportNamespaceSpecifier':
		case 'ImportSpecifier':
		case 'ImportAttribute':
		case 'JSXAttribute':
		case 'ObjectPattern':
		case 'ArrayPattern':
		case 'MetaProperty':
			return false;
		case 'ExportSpecifier':
			return grandparent?.type === 'ExportNamedDeclaration' &&
				grandparent.source
				? false
				: parent.local === node;
		case 'ObjectTypeProperty':
			return parent.key !== node;
		case 'TSEnumMember':
			return parent.id !== node;
		case 'TSPropertySignature':
			return parent.key === node ? Boolean(parent.computed) : true;
		default:
			return true;
	}
};

import {
	isExpression,
	type Node,
	type File,
	type ArrowFunctionExpression,
	type FunctionDeclaration,
	type FunctionExpression,
	type Expression,
} from '@babel/types';
import * as recast from 'recast';

const mathMethods = new Set([
	'abs',
	'acos',
	'acosh',
	'asin',
	'asinh',
	'atan',
	'atan2',
	'atanh',
	'cbrt',
	'ceil',
	'clz32',
	'cos',
	'cosh',
	'exp',
	'expm1',
	'floor',
	'fround',
	'hypot',
	'imul',
	'log',
	'log10',
	'log1p',
	'log2',
	'max',
	'min',
	'pow',
	'round',
	'sign',
	'sin',
	'sinh',
	'sqrt',
	'tan',
	'tanh',
	'trunc',
]);

const mathConstants = new Set([
	'E',
	'LN10',
	'LN2',
	'LOG10E',
	'LOG2E',
	'PI',
	'SQRT1_2',
	'SQRT2',
]);

const easingMethods = new Set([
	'back',
	'bezier',
	'bounce',
	'circle',
	'cubic',
	'ease',
	'elastic',
	'exp',
	'in',
	'inOut',
	'linear',
	'out',
	'poly',
	'quad',
	'sin',
	'spring',
	'step0',
	'step1',
]);

export const isPureMathMethod = (name: string) => mathMethods.has(name);
export const isPureMathConstant = (name: string) => mathConstants.has(name);

type SimpleFunction =
	| FunctionDeclaration
	| FunctionExpression
	| ArrowFunctionExpression;

type PureTopLevelFunctionsOptions = {
	ast: File;
	remotionImports: Map<string, string>;
	stablePrimitiveNames: Set<string>;
};

export const getPureTopLevelFunctionAnalysis = ({
	ast,
	remotionImports,
	stablePrimitiveNames,
}: PureTopLevelFunctionsOptions): {
	pureFunctionNames: Set<string>;
	primitiveFunctionNames: Set<string>;
} => {
	const topLevelBindings = new Set<string>();
	const duplicateBindings = new Set<string>();
	const reassignedNames = new Set<string>();
	const primitiveTopLevelConstants = new Set<string>();
	let hasDirectEval = false;
	const helpers = new Map<string, SimpleFunction>();
	const registerBinding = (name: string) => {
		if (topLevelBindings.has(name)) {
			duplicateBindings.add(name);
		}

		topLevelBindings.add(name);
	};

	for (const statement of ast.program.body) {
		if (statement.type === 'ImportDeclaration') {
			for (const specifier of statement.specifiers) {
				registerBinding(specifier.local.name);
			}

			continue;
		}

		const declaration =
			statement.type === 'ExportNamedDeclaration' ||
			statement.type === 'ExportDefaultDeclaration'
				? statement.declaration
				: statement;
		if (declaration?.type === 'FunctionDeclaration' && declaration.id) {
			registerBinding(declaration.id.name);
			helpers.set(declaration.id.name, declaration);
		} else if (declaration?.type === 'ClassDeclaration' && declaration.id) {
			registerBinding(declaration.id.name);
		} else if (declaration?.type === 'VariableDeclaration') {
			for (const declarator of declaration.declarations) {
				if (declarator.id.type !== 'Identifier') {
					continue;
				}

				registerBinding(declarator.id.name);
				if (
					declaration.kind === 'const' &&
					declarator.init &&
					([
						'StringLiteral',
						'NumericLiteral',
						'BooleanLiteral',
						'NullLiteral',
					].includes(declarator.init.type) ||
						(declarator.init.type === 'UnaryExpression' &&
							declarator.init.operator === '-' &&
							declarator.init.argument.type === 'NumericLiteral'))
				) {
					primitiveTopLevelConstants.add(declarator.id.name);
				}

				if (
					declaration.kind === 'const' &&
					(declarator.init?.type === 'ArrowFunctionExpression' ||
						declarator.init?.type === 'FunctionExpression')
				) {
					helpers.set(declarator.id.name, declarator.init);
				}
			}
		}
	}

	const collectAssignedNames = (target: Node) => {
		switch (target.type) {
			case 'Identifier':
				reassignedNames.add(target.name);
				break;
			case 'ParenthesizedExpression':
				collectAssignedNames(target.expression);
				break;
			case 'AssignmentPattern':
				collectAssignedNames(target.left);
				break;
			case 'RestElement':
				collectAssignedNames(target.argument);
				break;
			case 'ArrayPattern':
				for (const element of target.elements) {
					if (element) {
						collectAssignedNames(element);
					}
				}

				break;
			case 'ObjectPattern':
				for (const property of target.properties) {
					collectAssignedNames(
						property.type === 'ObjectProperty' ? property.value : property,
					);
				}

				break;
			default:
				break;
		}
	};

	// Function declarations are writable bindings. Be conservative even when a
	// write appears in another scope: this check never needs to prove that the
	// write refers to the same declaration.
	recast.visit(ast, {
		visitAssignmentExpression(path) {
			collectAssignedNames(path.node.left as Node);

			this.traverse(path);
		},
		visitUpdateExpression(path) {
			collectAssignedNames(path.node.argument as Node);

			this.traverse(path);
		},
		visitForInStatement(path) {
			collectAssignedNames(path.node.left as Node);

			this.traverse(path);
		},
		visitForOfStatement(path) {
			collectAssignedNames(path.node.left as Node);

			this.traverse(path);
		},
		visitCallExpression(path) {
			if (
				path.node.callee.type === 'Identifier' &&
				path.node.callee.name === 'eval'
			) {
				hasDirectEval = true;
			}

			this.traverse(path);
		},
	});

	const proven = new Set<string>();
	const visiting = new Set<string>();
	const isPureHelper = (name: string): boolean => {
		if (proven.has(name)) {
			return true;
		}

		if (
			hasDirectEval ||
			duplicateBindings.has(name) ||
			reassignedNames.has(name) ||
			visiting.has(name)
		) {
			return false;
		}

		const helper = helpers.get(name);
		if (!helper || helper.async || helper.generator) {
			return false;
		}

		const params = new Set<string>();
		for (const param of helper.params) {
			if (param.type !== 'Identifier') {
				return false;
			}

			params.add(param.name);
		}

		if (params.size !== helper.params.length) {
			return false;
		}

		const returnValue =
			helper.body.type === 'BlockStatement'
				? helper.body.body.length === 1 &&
					helper.body.body[0].type === 'ReturnStatement'
					? helper.body.body[0].argument
					: null
				: helper.body;
		if (!returnValue) {
			return false;
		}

		visiting.add(name);
		// The expression and helper checks recurse into each other.
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		const pure = isPureExpression(returnValue, params);
		visiting.delete(name);
		if (pure) {
			proven.add(name);
		}

		return pure;
	};

	const isKnownMember = (
		expression: Expression,
		params: Set<string>,
		forCall: boolean,
	) => {
		if (
			expression.type !== 'MemberExpression' ||
			expression.computed ||
			expression.object.type !== 'Identifier' ||
			expression.property.type !== 'Identifier'
		) {
			return false;
		}

		const {name: objectName} = expression.object;
		const {name: propertyName} = expression.property;
		if (params.has(objectName)) {
			return false;
		}

		if (objectName === 'Math' && !topLevelBindings.has('Math')) {
			return forCall
				? isPureMathMethod(propertyName)
				: isPureMathMethod(propertyName) || isPureMathConstant(propertyName);
		}

		return (
			remotionImports.get(objectName) === 'Easing' &&
			topLevelBindings.has(objectName) &&
			!duplicateBindings.has(objectName) &&
			easingMethods.has(propertyName)
		);
	};

	function isPureExpression(node: Node, params: Set<string>): boolean {
		if (!isExpression(node)) {
			return false;
		}

		const expression = node;
		switch (expression.type) {
			case 'StringLiteral':
			case 'NumericLiteral':
			case 'BooleanLiteral':
			case 'NullLiteral':
			case 'BigIntLiteral':
				return true;
			case 'Identifier':
				if (params.has(expression.name)) {
					return true;
				}

				if (
					['undefined', 'Infinity', 'NaN'].includes(expression.name) &&
					!topLevelBindings.has(expression.name)
				) {
					return true;
				}

				return (
					stablePrimitiveNames.has(expression.name) &&
					topLevelBindings.has(expression.name) &&
					!duplicateBindings.has(expression.name)
				);
			case 'ParenthesizedExpression':
			case 'TSAsExpression':
			case 'TSTypeAssertion':
			case 'TSNonNullExpression':
			case 'TSSatisfiesExpression':
				return isPureExpression(expression.expression, params);
			case 'UnaryExpression':
				return (
					['!', '+', '-', '~', 'typeof', 'void'].includes(
						expression.operator,
					) && isPureExpression(expression.argument, params)
				);
			case 'BinaryExpression':
				return (
					[
						'+',
						'-',
						'*',
						'/',
						'%',
						'**',
						'<',
						'<=',
						'>',
						'>=',
						'==',
						'!=',
						'===',
						'!==',
						'&',
						'|',
						'^',
						'<<',
						'>>',
						'>>>',
					].includes(expression.operator) &&
					isPureExpression(expression.left, params) &&
					isPureExpression(expression.right, params)
				);
			case 'LogicalExpression':
				return (
					isPureExpression(expression.left, params) &&
					isPureExpression(expression.right, params)
				);
			case 'ConditionalExpression':
				return (
					isPureExpression(expression.test, params) &&
					isPureExpression(expression.consequent, params) &&
					isPureExpression(expression.alternate, params)
				);
			case 'TemplateLiteral':
				return expression.expressions.every((part) =>
					isPureExpression(part, params),
				);
			case 'ArrayExpression':
				return expression.elements.every(
					(element) =>
						element === null ||
						(element.type !== 'SpreadElement' &&
							isPureExpression(element, params)),
				);
			case 'ObjectExpression':
				return expression.properties.every(
					(property) =>
						property.type === 'ObjectProperty' &&
						!property.computed &&
						property.key.type !== 'PrivateName' &&
						!(
							(property.key.type === 'Identifier' &&
								property.key.name === '__proto__') ||
							(property.key.type === 'StringLiteral' &&
								property.key.value === '__proto__')
						) &&
						property.value.type !== 'AssignmentPattern' &&
						isPureExpression(property.value, params),
				);
			case 'MemberExpression':
				return isKnownMember(expression, params, false);
			case 'CallExpression': {
				if (
					!expression.arguments.every(
						(argument) =>
							argument.type !== 'SpreadElement' &&
							argument.type !== 'ArgumentPlaceholder' &&
							isPureExpression(argument, params),
					)
				) {
					return false;
				}

				const {callee} = expression;
				if (callee.type === 'MemberExpression') {
					return isKnownMember(callee, params, true);
				}

				if (callee.type !== 'Identifier' || params.has(callee.name)) {
					return false;
				}

				if (
					!duplicateBindings.has(callee.name) &&
					(['interpolate', 'spring'].includes(
						remotionImports.get(callee.name) ?? '',
					) ||
						(remotionImports.get(callee.name) === 'interpolateColors' &&
							(expression.arguments.length === 3 ||
								expression.arguments.length === 4)) ||
						(remotionImports.get(callee.name) === 'random' &&
							expression.arguments.length === 1 &&
							['StringLiteral', 'NumericLiteral', 'TemplateLiteral'].includes(
								expression.arguments[0].type,
							)))
				) {
					return true;
				}

				return isPureHelper(callee.name);
			}

			default:
				return false;
		}
	}

	for (const name of helpers.keys()) {
		isPureHelper(name);
	}

	const primitiveFunctionNames = new Set<string>();
	const primitiveVisiting = new Set<string>();
	const isPrimitiveHelper = (name: string): boolean => {
		if (primitiveFunctionNames.has(name)) {
			return true;
		}

		if (!proven.has(name) || primitiveVisiting.has(name)) {
			return false;
		}

		const helper = helpers.get(name);
		if (!helper) {
			return false;
		}

		const params = new Set<string>();
		for (const param of helper.params) {
			if (param.type !== 'Identifier') {
				return false;
			}

			params.add(param.name);
		}

		const returnValue =
			helper.body.type === 'BlockStatement'
				? helper.body.body[0].type === 'ReturnStatement'
					? helper.body.body[0].argument
					: null
				: helper.body;
		if (!returnValue) {
			return false;
		}

		primitiveVisiting.add(name);
		// The expression and helper checks recurse into each other.
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		const primitive = isPrimitiveExpression(returnValue, params);
		primitiveVisiting.delete(name);
		if (primitive) {
			primitiveFunctionNames.add(name);
		}

		return primitive;
	};

	function isPrimitiveExpression(node: Node, params: Set<string>): boolean {
		if (!isExpression(node)) {
			return false;
		}

		switch (node.type) {
			case 'StringLiteral':
			case 'NumericLiteral':
			case 'BooleanLiteral':
			case 'NullLiteral':
				return true;
			case 'Identifier':
				if (params.has(node.name)) {
					return false;
				}

				if (
					['undefined', 'Infinity', 'NaN'].includes(node.name) &&
					!topLevelBindings.has(node.name)
				) {
					return true;
				}

				return (
					stablePrimitiveNames.has(node.name) &&
					primitiveTopLevelConstants.has(node.name) &&
					!duplicateBindings.has(node.name)
				);
			case 'ParenthesizedExpression':
			case 'TSAsExpression':
			case 'TSTypeAssertion':
			case 'TSNonNullExpression':
			case 'TSSatisfiesExpression':
				return isPrimitiveExpression(node.expression, params);
			case 'UnaryExpression':
				if (['!', 'typeof', 'void', '+'].includes(node.operator)) {
					return true;
				}

				return (
					(node.operator === '-' || node.operator === '~') &&
					isPrimitiveExpression(node.argument, params)
				);
			case 'BinaryExpression':
				if (
					['==', '===', '!=', '!==', '<', '<=', '>', '>=', '>>>'].includes(
						node.operator,
					)
				) {
					return true;
				}

				return (
					['+', '-', '*', '/', '%', '**', '&', '|', '^', '<<', '>>'].includes(
						node.operator,
					) &&
					(isPrimitiveExpression(node.left, params) ||
						isPrimitiveExpression(node.right, params))
				);
			case 'LogicalExpression':
				return (
					isPrimitiveExpression(node.left, params) &&
					isPrimitiveExpression(node.right, params)
				);
			case 'ConditionalExpression':
				return (
					isPrimitiveExpression(node.consequent, params) &&
					isPrimitiveExpression(node.alternate, params)
				);
			case 'TemplateLiteral':
				return true;
			case 'MemberExpression':
				return (
					!node.computed &&
					node.object.type === 'Identifier' &&
					node.object.name === 'Math' &&
					!params.has('Math') &&
					!topLevelBindings.has('Math') &&
					node.property.type === 'Identifier' &&
					isPureMathConstant(node.property.name)
				);
			case 'CallExpression': {
				const {callee} = node;
				if (callee.type === 'MemberExpression') {
					return (
						!callee.computed &&
						callee.object.type === 'Identifier' &&
						callee.object.name === 'Math' &&
						!params.has('Math') &&
						!topLevelBindings.has('Math') &&
						callee.property.type === 'Identifier' &&
						isPureMathMethod(callee.property.name)
					);
				}

				if (callee.type !== 'Identifier' || params.has(callee.name)) {
					return false;
				}

				if (
					!duplicateBindings.has(callee.name) &&
					['interpolate', 'spring', 'interpolateColors', 'random'].includes(
						remotionImports.get(callee.name) ?? '',
					)
				) {
					return true;
				}

				return isPrimitiveHelper(callee.name);
			}

			default:
				return false;
		}
	}

	for (const name of proven) {
		isPrimitiveHelper(name);
	}

	return {pureFunctionNames: proven, primitiveFunctionNames};
};

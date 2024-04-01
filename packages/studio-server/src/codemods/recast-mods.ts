import type {
	ArrowFunctionExpression,
	BlockStatement,
	ExportDefaultDeclaration,
	ExportNamedDeclaration,
	Expression,
	File,
	FunctionDeclaration,
	FunctionExpression,
	JSXAttribute,
	JSXElement,
	JSXFragment,
	ReturnStatement,
	Statement,
	VariableDeclaration,
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
		return mapAll(node, codeMod, changesMade);
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

const mapAll = <T extends Statement | Expression>(
	node: T,
	transformation: RecastCodemod,
	changesMade: Change[],
): T => {
	if (isDeclaration(node)) {
		return mapDeclaration(node, transformation, changesMade);
	}

	if (isExpression(node)) {
		return mapExpression(node, transformation, changesMade);
	}

	if (isStatement(node)) {
		return mapStatement(node, transformation, changesMade);
	}

	return node;
};

type RDeclaration =
	| VariableDeclaration
	| FunctionDeclaration
	| ExportNamedDeclaration
	| ExportDefaultDeclaration;
type RExpression =
	| ArrowFunctionExpression
	| FunctionExpression
	| JSXFragment
	| JSXElement;
type RStatement = BlockStatement | ReturnStatement;

const isDeclaration = (t: Statement | Expression): t is RDeclaration => {
	if (t.type === 'VariableDeclaration') {
		return true;
	}

	if (t.type === 'FunctionDeclaration') {
		return true;
	}

	if (t.type === 'ExportNamedDeclaration') {
		return true;
	}

	if (t.type === 'ExportDefaultDeclaration') {
		return true;
	}

	return false;
};

const isExpression = (t: Statement | Expression): t is RExpression => {
	if (t.type === 'ArrowFunctionExpression') {
		return true;
	}

	if (t.type === 'FunctionExpression') {
		return true;
	}

	if (t.type === 'JSXElement') {
		return true;
	}

	if (t.type === 'JSXFragment') {
		return true;
	}

	return false;
};

const isStatement = (t: Statement | Expression): t is RStatement => {
	if (t.type === 'ReturnStatement') {
		return true;
	}

	if (t.type === 'BlockStatement') {
		return true;
	}

	return false;
};

const mapDeclaration = <T extends RDeclaration>(
	declaration: T,
	transformation: RecastCodemod,
	changesMade: Change[],
): T => {
	if (declaration.type === 'VariableDeclaration') {
		const declarations = declaration.declarations.map((d) => {
			return mapVariableDeclarator(d, transformation, changesMade);
		});
		return {...declaration, declarations};
	}

	if (declaration.type === 'FunctionDeclaration') {
		return {
			...declaration,
			body: mapBlockStatement(declaration.body, transformation, changesMade),
		};
	}

	if (
		declaration.type === 'ExportNamedDeclaration' ||
		declaration.type === 'ExportDefaultDeclaration'
	) {
		if (!declaration.declaration) {
			return declaration;
		}

		return {
			...declaration,
			declaration: mapAll(declaration.declaration, transformation, changesMade),
		};
	}

	return declaration;
};

const mapVariableDeclarator = (
	variableDeclarator: VariableDeclarator,
	transformation: RecastCodemod,
	changesMade: Change[],
): VariableDeclarator => {
	return {
		...variableDeclarator,
		init: variableDeclarator.init
			? mapAll(variableDeclarator.init, transformation, changesMade)
			: variableDeclarator.init,
	};
};

const mapBlockStatement = (
	blockStatement: BlockStatement,
	transformation: RecastCodemod,
	changesMade: Change[],
): BlockStatement => {
	return {
		...blockStatement,
		body: blockStatement.body.map((a) => {
			return mapAll(a, transformation, changesMade);
		}),
	};
};

const mapStatement = <T extends Statement>(
	statement: T,
	transformation: RecastCodemod,
	changesMade: Change[],
): T => {
	if (statement.type === 'ReturnStatement') {
		return mapReturnStatement(statement, transformation, changesMade) as T;
	}

	if (statement.type === 'BlockStatement') {
		return mapBlockStatement(statement, transformation, changesMade) as T;
	}

	return statement;
};

const mapExpression = <T extends Expression>(
	expression: T,
	transformation: RecastCodemod,
	changesMade: Change[],
): T => {
	if (expression.type === 'JSXFragment' || expression.type === 'JSXElement') {
		return mapJsxElementOrFragment(
			expression,
			transformation,
			changesMade,
		) as T;
	}

	if (
		expression.type !== 'ArrowFunctionExpression' &&
		expression.type !== 'FunctionExpression'
	) {
		return expression;
	}

	return {
		...expression,
		body: mapAll(expression.body, transformation, changesMade),
	};
};

const mapReturnStatement = (
	statement: ReturnStatement,
	transformation: RecastCodemod,
	changesMade: Change[],
): ReturnStatement => {
	if (!statement.argument) {
		return statement;
	}

	return {
		...statement,
		argument: mapAll(statement.argument, transformation, changesMade),
	};
};

const mapJsxElementOrFragment = <T extends JSXFragment | JSXElement>(
	jsxFragment: T,
	transformation: RecastCodemod,
	changesMade: Change[],
): T => {
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
			changeComposition({
				jsxElement: c,
				newCompositionId: transformation.newId,
				newCompositionFps: transformation.newFps,
				newCompositionDurationInFrames: transformation.newDurationInFrames,
				newCompositionHeight: transformation.newHeight,
				newCompositionWidth: transformation.newWidth,
				newTagToUse: transformation.tag,
				changesMade,
			}),
		];
	}

	if (
		transformation.type === 'rename-composition' &&
		compId === transformation.idToRename
	) {
		return [
			changeComposition({
				jsxElement: c,
				newCompositionId: transformation.newId,
				newCompositionFps: null,
				newCompositionDurationInFrames: null,
				newCompositionHeight: null,
				newCompositionWidth: null,
				changesMade,
				newTagToUse: null,
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

	if (c.type === 'JSXText') {
		return [c];
	}

	if (c.type === 'JSXExpressionContainer') {
		return [c];
	}

	if (c.type === 'JSXSpreadChild') {
		return [c];
	}

	return [mapExpression(c, transformation, changesMade)];
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

const changeComposition = ({
	jsxElement,
	newCompositionId,
	newCompositionFps,
	newCompositionDurationInFrames,
	newCompositionHeight,
	newCompositionWidth,
	changesMade,
	newTagToUse,
}: {
	jsxElement: JSXFragment['children'][number];
	newCompositionId: string;
	newCompositionFps: number | null;
	newCompositionDurationInFrames: number | null;
	newCompositionHeight: number | null;
	newCompositionWidth: number | null;
	newTagToUse: 'Composition' | 'Still' | null;
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

	if (name.name !== 'Composition' && name.name !== 'Still') {
		return jsxElement;
	}

	const attributes = openingElement.attributes
		.map((attribute) => {
			if (attribute.type === 'JSXSpreadAttribute') {
				return attribute;
			}

			if (attribute.name.type === 'JSXNamespacedName') {
				return attribute;
			}

			if (attribute.name.name === 'fps' && newTagToUse === 'Still') {
				changesMade.push({description: 'Removed fps attribute'});
				return null;
			}

			if (
				attribute.name.name === 'durationInFrames' &&
				newTagToUse === 'Still'
			) {
				changesMade.push({description: 'Removed durationInFrames'});
				return null;
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
						expression: {
							...attribute.value.expression,
							value: newCompositionFps,
						},
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
		})
		.filter(Boolean) as JSXAttribute[];

	const newName = newTagToUse ?? name.name;
	if (newName !== name.name) {
		changesMade.push({
			description: `Changed tag`,
		});
	}

	return {
		...jsxElement,
		openingElement: {
			...jsxElement.openingElement,
			name: {
				...name,
				name: newName,
			},
			attributes,
		},
	};
};

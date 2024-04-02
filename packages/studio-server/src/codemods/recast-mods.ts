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
	if (isRecognizedType(node)) {
		return mapRecognizedType(node, transformation, changesMade);
	}

	return node;
};

type RecognizedType =
	| ArrowFunctionExpression
	| FunctionExpression
	| JSXFragment
	| JSXElement
	| BlockStatement
	| ReturnStatement
	| VariableDeclaration
	| FunctionDeclaration
	| ExportNamedDeclaration
	| ExportDefaultDeclaration;

const isRecognizedType = (t: Statement | Expression): t is RecognizedType => {
	return (
		t.type === 'ArrowFunctionExpression' ||
		t.type === 'FunctionExpression' ||
		t.type === 'JSXFragment' ||
		t.type === 'JSXElement' ||
		t.type === 'BlockStatement' ||
		t.type === 'ReturnStatement' ||
		t.type === 'VariableDeclaration' ||
		t.type === 'FunctionDeclaration' ||
		t.type === 'ExportNamedDeclaration' ||
		t.type === 'ExportDefaultDeclaration'
	);
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
			.map((c) => {
				if (c.type !== 'JSXElement') {
					return c;
				}

				return mapJsxChild(c, transformation, changesMade);
			})
			.flat(1),
	};
};

const mapJsxChild = (
	c: JSXElement,
	transformation: RecastCodemod | null,
	changesMade: Change[],
): JSXElement[] => {
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

	return [mapAll(c, transformation, changesMade)];
};

const mapRecognizedType = <T extends RecognizedType>(
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
		expression.type === 'ArrowFunctionExpression' ||
		expression.type === 'FunctionExpression'
	) {
		return {
			...expression,
			body: mapAll(expression.body, transformation, changesMade),
		};
	}

	if (expression.type === 'VariableDeclaration') {
		const declarations = expression.declarations.map((d) => {
			return mapVariableDeclarator(d, transformation, changesMade);
		});
		return {...expression, declarations};
	}

	if (expression.type === 'FunctionDeclaration') {
		return {
			...expression,
			body: mapBlockStatement(expression.body, transformation, changesMade),
		};
	}

	if (
		expression.type === 'ExportNamedDeclaration' ||
		expression.type === 'ExportDefaultDeclaration'
	) {
		if (!expression.declaration) {
			return expression;
		}

		return {
			...expression,
			declaration: mapAll(expression.declaration, transformation, changesMade),
		};
	}

	if (expression.type === 'ReturnStatement') {
		return mapReturnStatement(expression, transformation, changesMade) as T;
	}

	if (expression.type === 'BlockStatement') {
		return mapBlockStatement(expression, transformation, changesMade) as T;
	}

	return expression;
};

const getCompositionIdFromJSXElement = (
	jsxElement: JSXFragment['children'][number],
) => {
	if (jsxElement.type !== 'JSXElement') {
		return null;
	}

	const {openingElement} = jsxElement;
	const {name} = openingElement;
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

			if (attribute.value.type === 'StringLiteral') {
				return attribute.value.value;
			}

			if (
				attribute.value.type === 'JSXExpressionContainer' &&
				attribute.value.expression.type === 'StringLiteral'
			) {
				return attribute.value.expression.value;
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
	jsxElement: JSXElement;
	newCompositionId: string;
	newCompositionFps: number | null;
	newCompositionDurationInFrames: number | null;
	newCompositionHeight: number | null;
	newCompositionWidth: number | null;
	newTagToUse: 'Composition' | 'Still' | null;
	changesMade: Change[];
}): JSXElement => {
	const {openingElement} = jsxElement;
	const {name} = openingElement;
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

			// id="one"
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

			// id={"one"}
			if (
				attribute.name.name === 'id' &&
				attribute.value &&
				attribute.value.type === 'JSXExpressionContainer' &&
				attribute.value.expression.type === 'StringLiteral'
			) {
				changesMade.push({
					description: 'Replaced composition id',
				});

				return {
					...attribute,
					value: {
						...attribute.value,
						expression: {
							...attribute.value.expression,
							value: newCompositionId,
						},
					},
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

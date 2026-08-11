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
	JSXIdentifier,
	NullLiteral,
	ReturnStatement,
	Statement,
	VariableDeclaration,
	VariableDeclarator,
} from '@babel/types';
import type {RecastCodemod} from '@remotion/studio-shared';
import * as recast from 'recast';
import {applyVisualControl} from './apply-visual-control';
import {deleteJsxElementAtPath} from './delete-jsx-node';
import {stripParenthesizedExtra} from './strip-parenthesized-extra';

export type Change = {
	description: string;
};

const b = recast.types.builders;

export type ApplyCodeModReturnType = {newAst: File; changesMade: Change[]};

export const applyCodemod = ({
	file,
	codeMod,
}: {
	file: File;
	codeMod: RecastCodemod;
}): ApplyCodeModReturnType => {
	const changesMade: Change[] = [];

	if (codeMod.type === 'apply-visual-control') {
		return applyVisualControl({file, transformation: codeMod, changesMade});
	}

	if (codeMod.type === 'move-composition-to-folder') {
		return moveCompositionToFolder({
			file,
			transformation: codeMod,
			changesMade,
		});
	}

	const body = file.program.body.map((node) => {
		return mapAll(node, codeMod, changesMade, null);
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
	parentFolderName: string | null,
): T => {
	if (isRecognizedType(node)) {
		return mapRecognizedType(
			node,
			transformation,
			changesMade,
			parentFolderName,
		);
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
	parentFolderName: string | null,
): VariableDeclarator => {
	return {
		...variableDeclarator,
		init: variableDeclarator.init
			? mapAll(
					variableDeclarator.init,
					transformation,
					changesMade,
					parentFolderName,
				)
			: variableDeclarator.init,
	};
};

const mapBlockStatement = (
	blockStatement: BlockStatement,
	transformation: RecastCodemod,
	changesMade: Change[],
	parentFolderName: string | null,
): BlockStatement => {
	return {
		...blockStatement,
		body: blockStatement.body.map((a) => {
			return mapAll(a, transformation, changesMade, parentFolderName);
		}),
	};
};

const mapReturnStatement = (
	statement: ReturnStatement,
	transformation: RecastCodemod,
	changesMade: Change[],
	parentFolderName: string | null,
): ReturnStatement => {
	if (!statement.argument) {
		return statement;
	}

	if (
		transformation.type === 'new-composition' &&
		transformation.folderName === null &&
		(statement.argument.type === 'JSXElement' ||
			statement.argument.type === 'JSXFragment')
	) {
		return {
			...statement,
			argument: addNewCompositionToRootJsx(
				statement.argument,
				transformation,
				changesMade,
			),
		};
	}

	if (
		transformation.type === 'new-folder' &&
		transformation.parentName === null &&
		(statement.argument.type === 'JSXElement' ||
			statement.argument.type === 'JSXFragment')
	) {
		return {
			...statement,
			argument: addNewFolderToRootJsx(
				statement.argument,
				transformation,
				changesMade,
			),
		};
	}

	const replacement = transformLoneJsxElement(
		statement.argument,
		transformation,
		changesMade,
		parentFolderName,
	);
	if (replacement !== null) {
		return {...statement, argument: replacement};
	}

	return {
		...statement,
		argument: mapAll(
			statement.argument,
			transformation,
			changesMade,
			parentFolderName,
		),
	};
};

const nullLiteral = (): NullLiteral => ({type: 'NullLiteral'});

const wrapInJsxFragment = (children: JSXFragment['children']): JSXFragment => ({
	type: 'JSXFragment',
	openingFragment: {type: 'JSXOpeningFragment'},
	closingFragment: {type: 'JSXClosingFragment'},
	children: children.map((child) => {
		if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
			return stripParenthesizedExtra(child);
		}

		return child;
	}),
});

const isJsxExpression = (
	child: JSXFragment['children'][number],
): child is JSXElement | JSXFragment => {
	return child.type === 'JSXElement' || child.type === 'JSXFragment';
};

const isMeaningfulJsxChild = (child: JSXFragment['children'][number]) => {
	return child.type !== 'JSXText' || child.value.trim() !== '';
};

const jsxId = (name: string): JSXIdentifier => ({type: 'JSXIdentifier', name});

const jsxAttributeWithString = (name: string, value: string): JSXAttribute => ({
	type: 'JSXAttribute',
	name: jsxId(name),
	value: {type: 'StringLiteral', value},
});

const jsxAttributeWithExpression = (
	name: string,
	expression: Expression,
): JSXAttribute => ({
	type: 'JSXAttribute',
	name: jsxId(name),
	value: {
		type: 'JSXExpressionContainer',
		expression,
	},
});

const newCompositionElement = (
	transformation: Extract<RecastCodemod, {type: 'new-composition'}>,
): JSXElement => {
	return {
		type: 'JSXElement',
		openingElement: {
			type: 'JSXOpeningElement',
			name: jsxId('Composition'),
			attributes: [
				jsxAttributeWithString('id', transformation.newId),
				jsxAttributeWithExpression(
					'component',
					b.identifier(transformation.componentName) as Expression,
				),
				jsxAttributeWithExpression(
					'durationInFrames',
					b.numericLiteral(transformation.newDurationInFrames) as Expression,
				),
				jsxAttributeWithExpression(
					'fps',
					b.numericLiteral(transformation.newFps) as Expression,
				),
				jsxAttributeWithExpression(
					'width',
					b.numericLiteral(transformation.newWidth) as Expression,
				),
				jsxAttributeWithExpression(
					'height',
					b.numericLiteral(transformation.newHeight) as Expression,
				),
			],
			selfClosing: true,
		},
		closingElement: null,
		children: [],
	};
};

const newFolderElement = (
	transformation: Extract<RecastCodemod, {type: 'new-folder'}>,
): JSXElement => {
	return {
		type: 'JSXElement',
		openingElement: {
			type: 'JSXOpeningElement',
			name: jsxId('Folder'),
			attributes: [jsxAttributeWithString('name', transformation.folderName)],
			selfClosing: true,
		},
		closingElement: null,
		children: [],
	};
};

const addNewCompositionToRootJsx = <T extends JSXElement | JSXFragment>(
	root: T,
	transformation: Extract<RecastCodemod, {type: 'new-composition'}>,
	changesMade: Change[],
): JSXElement | JSXFragment => {
	if (changesMade.length > 0) {
		return root;
	}

	changesMade.push({
		description: 'Added new composition',
	});

	if (root.type === 'JSXFragment') {
		return {
			...root,
			children: [...root.children, newCompositionElement(transformation)],
		};
	}

	return wrapInJsxFragment([root, newCompositionElement(transformation)]);
};

const addNewFolderToRootJsx = <T extends JSXElement | JSXFragment>(
	root: T,
	transformation: Extract<RecastCodemod, {type: 'new-folder'}>,
	changesMade: Change[],
): JSXElement | JSXFragment => {
	if (changesMade.length > 0) {
		return root;
	}

	changesMade.push({
		description: 'Added new folder',
	});

	if (root.type === 'JSXFragment') {
		return {
			...root,
			children: [...root.children, newFolderElement(transformation)],
		};
	}

	return wrapInJsxFragment([root, newFolderElement(transformation)]);
};

const addNewCompositionToFolder = (
	folderElement: JSXElement,
	transformation: Extract<RecastCodemod, {type: 'new-composition'}>,
	changesMade: Change[],
): JSXElement => {
	if (changesMade.length > 0) {
		return folderElement;
	}

	changesMade.push({
		description: 'Added new composition',
	});

	return {
		...folderElement,
		openingElement: {
			...folderElement.openingElement,
			selfClosing: false,
		},
		closingElement: folderElement.closingElement ?? {
			type: 'JSXClosingElement',
			name: folderElement.openingElement.name,
		},
		children: [
			...folderElement.children,
			newCompositionElement(transformation),
		],
	};
};

const addNewFolderToFolder = (
	folderElement: JSXElement,
	transformation: Extract<RecastCodemod, {type: 'new-folder'}>,
	changesMade: Change[],
): JSXElement => {
	if (changesMade.length > 0) {
		return folderElement;
	}

	changesMade.push({
		description: 'Added new folder',
	});

	return {
		...folderElement,
		openingElement: {
			...folderElement.openingElement,
			selfClosing: false,
		},
		closingElement: folderElement.closingElement ?? {
			type: 'JSXClosingElement',
			name: folderElement.openingElement.name,
		},
		children: [...folderElement.children, newFolderElement(transformation)],
	};
};

const getChildFolderParentName = ({
	folderName,
	parentFolderName,
}: {
	folderName: string;
	parentFolderName: string | null;
}) => {
	return [parentFolderName, folderName].filter(Boolean).join('/');
};

const appendCompositionToFolder = ({
	compositionElement,
	folderElement,
}: {
	compositionElement: JSXElement;
	folderElement: JSXElement;
}) => {
	folderElement.openingElement.selfClosing = false;
	folderElement.closingElement = folderElement.closingElement ?? {
		type: 'JSXClosingElement',
		name: folderElement.openingElement.name,
	};
	folderElement.children.push(stripParenthesizedExtra(compositionElement));
};

const appendCompositionToRoot = ({
	compositionElement,
	file,
}: {
	compositionElement: JSXElement;
	file: File;
}) => {
	let appended = false;

	recast.types.visit(file, {
		visitReturnStatement(astPath) {
			if (appended) {
				return false;
			}

			const {argument} = astPath.node;
			if (argument?.type !== 'JSXFragment' && argument?.type !== 'JSXElement') {
				this.traverse(astPath);
				return undefined;
			}

			if (argument.type === 'JSXFragment') {
				(argument.children as JSXFragment['children']).push(
					stripParenthesizedExtra(compositionElement),
				);
			} else {
				astPath.node.argument = wrapInJsxFragment([
					argument as unknown as JSXElement,
					compositionElement,
				]) as never;
			}

			appended = true;
			return false;
		},
	});

	if (!appended) {
		throw new Error('Could not find a root JSX element');
	}
};

const moveCompositionToFolder = ({
	file,
	transformation,
	changesMade,
}: {
	file: File;
	transformation: Extract<RecastCodemod, {type: 'move-composition-to-folder'}>;
	changesMade: Change[];
}): ApplyCodeModReturnType => {
	let sourcePath: recast.types.NodePath | null = null;
	let sourceParentFolderName: string | null = null;
	let sourceIsDirectJsxChild = false;
	let targetFolder: JSXElement | null = null;
	const folderStack: string[] = [];

	const isDirectJsxChild = (astPath: recast.types.NodePath) => {
		const parent = astPath.parentPath?.node;
		return (
			(parent?.type === 'JSXElement' || parent?.type === 'JSXFragment') &&
			parent.children.includes(astPath.node as JSXElement)
		);
	};

	const visitJsxElementWithFolderContext = (astPath: recast.types.NodePath) => {
		const node = astPath.node as JSXElement;
		const compositionId = getCompositionIdFromJSXElement(node);
		if (compositionId === transformation.idToMove) {
			sourcePath = astPath;
			sourceParentFolderName = folderStack.join('/') || null;
			sourceIsDirectJsxChild = isDirectJsxChild(astPath);
		}

		const folderName = getFolderNameFromJSXElement(node);
		const parentName = folderStack.join('/') || null;
		if (
			transformation.folderName !== null &&
			folderName === transformation.folderName &&
			parentName === transformation.parentName
		) {
			targetFolder = node;
		}

		if (folderName) {
			folderStack.push(folderName);
		}

		for (let i = 0; i < node.children.length; i++) {
			if (node.children[i].type !== 'JSXElement') {
				continue;
			}

			visitJsxElementWithFolderContext(
				astPath.get('children', i) as recast.types.NodePath,
			);
		}

		if (folderName) {
			folderStack.pop();
		}
	};

	recast.types.visit(file, {
		visitJSXElement(astPath) {
			visitJsxElementWithFolderContext(
				astPath as unknown as recast.types.NodePath,
			);
			return false;
		},
	});

	if (!sourcePath) {
		throw new Error(`Could not find composition "${transformation.idToMove}"`);
	}

	if (!sourceIsDirectJsxChild) {
		throw new Error(
			`Cannot move composition "${transformation.idToMove}" because it is not a direct JSX child`,
		);
	}

	if (transformation.folderName === null && sourceParentFolderName === null) {
		return {newAst: file, changesMade};
	}

	if (transformation.folderName !== null && !targetFolder) {
		const folderLabel = `${transformation.parentName ? `${transformation.parentName}/` : ''}${transformation.folderName}`;
		throw new Error(`Could not find folder "${folderLabel}"`);
	}

	const compositionElement = (sourcePath as recast.types.NodePath)
		.node as JSXElement;
	deleteJsxElementAtPath(sourcePath);
	if (transformation.folderName === null) {
		appendCompositionToRoot({compositionElement, file});
		changesMade.push({description: 'Moved composition to root'});
	} else {
		if (targetFolder === null) {
			throw new Error('Could not find target folder');
		}

		appendCompositionToFolder({
			compositionElement,
			folderElement: targetFolder,
		});
		changesMade.push({description: 'Moved composition into folder'});
	}

	return {newAst: file, changesMade};
};

// When a <Composition> JSX element appears in a position where it cannot
// simply be removed from a parent's children list (e.g. as the sole return
// value of a wrapper component or as the concise body of an arrow function),
// we still want delete/rename/duplicate codemods to work. This helper detects
// that case and produces a structurally-valid replacement expression.
const transformLoneJsxElement = (
	expression: Expression,
	transformation: RecastCodemod,
	changesMade: Change[],
	parentFolderName: string | null,
): Expression | null => {
	if (expression.type !== 'JSXElement') {
		return null;
	}

	const compId = getCompositionIdFromJSXElement(expression);
	const folderName = getFolderNameFromJSXElement(expression);
	if (compId === null) {
		const isFolderMatch =
			folderName !== null &&
			((transformation.type === 'delete-folder' &&
				folderName === transformation.folderName &&
				parentFolderName === transformation.parentName) ||
				(transformation.type === 'rename-folder' &&
					folderName === transformation.folderName &&
					parentFolderName === transformation.parentName) ||
				(transformation.type === 'new-composition' &&
					folderName === transformation.folderName &&
					parentFolderName === transformation.parentName) ||
				(transformation.type === 'new-folder' &&
					getChildFolderParentName({folderName, parentFolderName}) ===
						transformation.parentName));

		if (!isFolderMatch) {
			return null;
		}
	}

	const isMatch =
		(transformation.type === 'delete-composition' &&
			compId === transformation.idToDelete) ||
		(transformation.type === 'rename-composition' &&
			compId === transformation.idToRename) ||
		(transformation.type === 'update-composition-metadata' &&
			compId === transformation.idToUpdate) ||
		(transformation.type === 'duplicate-composition' &&
			compId === transformation.idToDuplicate) ||
		(transformation.type === 'delete-folder' &&
			folderName === transformation.folderName &&
			parentFolderName === transformation.parentName) ||
		(transformation.type === 'rename-folder' &&
			folderName === transformation.folderName &&
			parentFolderName === transformation.parentName) ||
		(transformation.type === 'new-composition' &&
			folderName === transformation.folderName &&
			parentFolderName === transformation.parentName) ||
		(transformation.type === 'new-folder' &&
			folderName !== null &&
			getChildFolderParentName({folderName, parentFolderName}) ===
				transformation.parentName);

	if (!isMatch) {
		return null;
	}

	const transformed = mapJsxChild(
		expression,
		transformation,
		changesMade,
		parentFolderName,
	);
	const meaningful = transformed.filter(isMeaningfulJsxChild);

	if (meaningful.length === 0) {
		return nullLiteral();
	}

	if (meaningful.length === 1 && isJsxExpression(meaningful[0])) {
		return meaningful[0];
	}

	return wrapInJsxFragment(transformed);
};

const mapJsxElementOrFragment = <T extends JSXFragment | JSXElement>(
	jsxFragment: T,
	transformation: RecastCodemod,
	changesMade: Change[],
	parentFolderName: string | null,
): T => {
	return {
		...jsxFragment,
		children: jsxFragment.children
			.map((c) => {
				if (c.type !== 'JSXElement') {
					return c;
				}

				return mapJsxChild(c, transformation, changesMade, parentFolderName);
			})
			.flat(1),
	};
};

const mapJsxChild = (
	c: JSXElement,
	transformation: RecastCodemod | null,
	changesMade: Change[],
	parentFolderName: string | null,
): JSXFragment['children'] => {
	const compId = getCompositionIdFromJSXElement(c);
	const folderName = getFolderNameFromJSXElement(c);

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
		transformation.type === 'update-composition-metadata' &&
		compId === transformation.idToUpdate
	) {
		return [
			changeComposition({
				jsxElement: c,
				newCompositionId: null,
				newCompositionFps: transformation.newFps,
				newCompositionDurationInFrames: transformation.newDurationInFrames,
				newCompositionHeight: transformation.newHeight,
				newCompositionWidth: transformation.newWidth,
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

	if (
		transformation.type === 'rename-folder' &&
		folderName === transformation.folderName &&
		parentFolderName === transformation.parentName
	) {
		return [
			changeFolderName({
				jsxElement: c,
				newFolderName: transformation.newName,
				changesMade,
			}),
		];
	}

	if (
		transformation.type === 'delete-folder' &&
		folderName === transformation.folderName &&
		parentFolderName === transformation.parentName
	) {
		changesMade.push({
			description: 'Deleted folder',
		});
		return c.children;
	}

	if (
		transformation.type === 'new-composition' &&
		folderName === transformation.folderName &&
		parentFolderName === transformation.parentName
	) {
		return [addNewCompositionToFolder(c, transformation, changesMade)];
	}

	if (
		transformation.type === 'new-folder' &&
		folderName !== null &&
		getChildFolderParentName({folderName, parentFolderName}) ===
			transformation.parentName
	) {
		return [addNewFolderToFolder(c, transformation, changesMade)];
	}

	const childParentFolderName = folderName
		? getChildFolderParentName({folderName, parentFolderName})
		: parentFolderName;

	return [mapAll(c, transformation, changesMade, childParentFolderName)];
};

const mapRecognizedType = <T extends RecognizedType>(
	expression: T,
	transformation: RecastCodemod,
	changesMade: Change[],
	parentFolderName: string | null,
): T => {
	if (expression.type === 'JSXFragment' || expression.type === 'JSXElement') {
		return mapJsxElementOrFragment(
			expression,
			transformation,
			changesMade,
			parentFolderName,
		) as T;
	}

	if (
		expression.type === 'ArrowFunctionExpression' ||
		expression.type === 'FunctionExpression'
	) {
		if (
			transformation.type === 'new-composition' &&
			transformation.folderName === null &&
			(expression.body.type === 'JSXElement' ||
				expression.body.type === 'JSXFragment')
		) {
			return {
				...expression,
				body: addNewCompositionToRootJsx(
					expression.body,
					transformation,
					changesMade,
				),
			};
		}

		if (
			transformation.type === 'new-folder' &&
			transformation.parentName === null &&
			(expression.body.type === 'JSXElement' ||
				expression.body.type === 'JSXFragment')
		) {
			return {
				...expression,
				body: addNewFolderToRootJsx(
					expression.body,
					transformation,
					changesMade,
				),
			};
		}

		if (
			expression.type === 'ArrowFunctionExpression' &&
			expression.body.type === 'JSXElement'
		) {
			const replacement = transformLoneJsxElement(
				expression.body,
				transformation,
				changesMade,
				parentFolderName,
			);
			if (replacement !== null) {
				return {
					...expression,
					body: replacement,
				};
			}
		}

		return {
			...expression,
			body: mapAll(
				expression.body,
				transformation,
				changesMade,
				parentFolderName,
			),
		};
	}

	if (expression.type === 'VariableDeclaration') {
		const declarations = expression.declarations.map((d) => {
			return mapVariableDeclarator(
				d,
				transformation,
				changesMade,
				parentFolderName,
			);
		});
		return {...expression, declarations};
	}

	if (expression.type === 'FunctionDeclaration') {
		return {
			...expression,
			body: mapBlockStatement(
				expression.body,
				transformation,
				changesMade,
				parentFolderName,
			),
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
			declaration: mapAll(
				expression.declaration,
				transformation,
				changesMade,
				parentFolderName,
			),
		};
	}

	if (expression.type === 'ReturnStatement') {
		return mapReturnStatement(
			expression,
			transformation,
			changesMade,
			parentFolderName,
		) as T;
	}

	if (expression.type === 'BlockStatement') {
		return mapBlockStatement(
			expression,
			transformation,
			changesMade,
			parentFolderName,
		) as T;
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

const getFolderNameFromJSXElement = (
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

	if (name.name !== 'Folder') {
		return null;
	}

	const folderName = openingElement.attributes
		.map((attribute) => {
			if (attribute.type === 'JSXSpreadAttribute') {
				return null;
			}

			if (attribute.name.type === 'JSXNamespacedName') {
				return null;
			}

			if (attribute.name.name !== 'name') {
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

	return folderName[0];
};

const changeFolderName = ({
	jsxElement,
	newFolderName,
	changesMade,
}: {
	jsxElement: JSXElement;
	newFolderName: string;
	changesMade: Change[];
}): JSXElement => {
	const {openingElement} = jsxElement;
	const {name} = openingElement;
	if (name.type !== 'JSXIdentifier') {
		return jsxElement;
	}

	if (name.name !== 'Folder') {
		return jsxElement;
	}

	const attributes = openingElement.attributes.map((attribute) => {
		if (attribute.type === 'JSXSpreadAttribute') {
			return attribute;
		}

		if (attribute.name.type === 'JSXNamespacedName') {
			return attribute;
		}

		if (
			attribute.name.name === 'name' &&
			attribute.value &&
			attribute.value.type === 'StringLiteral'
		) {
			changesMade.push({
				description: 'Replaced folder name',
			});

			return {
				...attribute,
				value: {...attribute.value, value: newFolderName},
			};
		}

		if (
			attribute.name.name === 'name' &&
			attribute.value &&
			attribute.value.type === 'JSXExpressionContainer' &&
			attribute.value.expression.type === 'StringLiteral'
		) {
			changesMade.push({
				description: 'Replaced folder name',
			});

			return {
				...attribute,
				value: {
					...attribute.value,
					expression: {
						...attribute.value.expression,
						value: newFolderName,
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
	newCompositionId: string | null;
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
				attribute.value.type === 'StringLiteral' &&
				newCompositionId !== null
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
				attribute.value.expression.type === 'StringLiteral' &&
				newCompositionId !== null
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

			if (attribute.name.name === 'fps' && newCompositionFps !== null) {
				changesMade.push({
					description: 'Replaced FPS',
				});

				return {
					...attribute,
					value: b.jsxExpressionContainer(b.numericLiteral(newCompositionFps)),
				};
			}

			if (
				attribute.name.name === 'durationInFrames' &&
				newCompositionDurationInFrames !== null
			) {
				changesMade.push({
					description: 'Replaced durationInFrames',
				});

				return {
					...attribute,
					value: b.jsxExpressionContainer(
						b.numericLiteral(newCompositionDurationInFrames),
					),
				};
			}

			if (attribute.name.name === 'width' && newCompositionWidth !== null) {
				changesMade.push({
					description: 'Replaced width',
				});

				return {
					...attribute,
					value: b.jsxExpressionContainer(
						b.numericLiteral(newCompositionWidth),
					),
				};
			}

			if (attribute.name.name === 'height' && newCompositionHeight !== null) {
				changesMade.push({
					description: 'Replaced height',
				});

				return {
					...attribute,
					value: b.jsxExpressionContainer(
						b.numericLiteral(newCompositionHeight),
					),
				};
			}

			return attribute;
		})
		.filter(Boolean) as typeof openingElement.attributes;

	if (
		newCompositionFps !== null &&
		!attributes.some(
			(attribute) =>
				attribute.type === 'JSXAttribute' &&
				attribute.name.type === 'JSXIdentifier' &&
				attribute.name.name === 'fps',
		)
	) {
		changesMade.push({description: 'Added FPS'});
		attributes.push(
			jsxAttributeWithExpression(
				'fps',
				b.numericLiteral(newCompositionFps) as Expression,
			),
		);
	}

	if (
		newCompositionDurationInFrames !== null &&
		!attributes.some(
			(attribute) =>
				attribute.type === 'JSXAttribute' &&
				attribute.name.type === 'JSXIdentifier' &&
				attribute.name.name === 'durationInFrames',
		)
	) {
		changesMade.push({description: 'Added durationInFrames'});
		attributes.push(
			jsxAttributeWithExpression(
				'durationInFrames',
				b.numericLiteral(newCompositionDurationInFrames) as Expression,
			),
		);
	}

	if (
		newCompositionWidth !== null &&
		!attributes.some(
			(attribute) =>
				attribute.type === 'JSXAttribute' &&
				attribute.name.type === 'JSXIdentifier' &&
				attribute.name.name === 'width',
		)
	) {
		changesMade.push({description: 'Added width'});
		attributes.push(
			jsxAttributeWithExpression(
				'width',
				b.numericLiteral(newCompositionWidth) as Expression,
			),
		);
	}

	if (
		newCompositionHeight !== null &&
		!attributes.some(
			(attribute) =>
				attribute.type === 'JSXAttribute' &&
				attribute.name.type === 'JSXIdentifier' &&
				attribute.name.name === 'height',
		)
	) {
		changesMade.push({description: 'Added height'});
		attributes.push(
			jsxAttributeWithExpression(
				'height',
				b.numericLiteral(newCompositionHeight) as Expression,
			),
		);
	}

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

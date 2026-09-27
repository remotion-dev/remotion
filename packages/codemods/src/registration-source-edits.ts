import type {File, JSXElement, JSXFragment, Node} from '@babel/types';
import * as recast from 'recast';
import type {FolderReference} from './composition-editing';
import {getInsertionRootSourceEdit} from './insert-jsx-element';
import {printInsertedJsx} from './print-jsx';
import {getJsxComponentIdentity} from './sequence-props/jsx-component-identity';
import type {SourceEdit} from './source-edits';

const getRegistrationComponentType = (
	element: JSXFragment['children'][number],
	ast: File,
): 'Composition' | 'Still' | 'Folder' | null => {
	if (element.type !== 'JSXElement') return null;
	const identity = getJsxComponentIdentity({
		ast,
		jsxElement: element.openingElement,
	});
	for (const tag of ['Composition', 'Still', 'Folder'] as const) {
		if (identity === `dev.remotion.remotion.${tag}` || identity === tag)
			return tag;
	}

	return null;
};

export const getCompositionIdFromJSXElement = (
	element: JSXFragment['children'][number],
	ast: File,
): string | null => {
	if (element.type !== 'JSXElement') return null;
	const tag = getRegistrationComponentType(element, ast);
	if (tag !== 'Composition' && tag !== 'Still') return null;

	for (const attribute of element.openingElement.attributes) {
		if (
			attribute.type !== 'JSXAttribute' ||
			attribute.name.type !== 'JSXIdentifier' ||
			attribute.name.name !== 'id'
		) {
			continue;
		}

		if (attribute.value?.type === 'StringLiteral') {
			return attribute.value.value;
		}

		if (
			attribute.value?.type === 'JSXExpressionContainer' &&
			attribute.value.expression.type === 'StringLiteral'
		) {
			return attribute.value.expression.value;
		}
	}

	return null;
};

export const getFolderNameFromJSXElement = (
	element: JSXFragment['children'][number],
	ast: File,
): string | null => {
	if (element.type !== 'JSXElement') return null;
	if (getRegistrationComponentType(element, ast) !== 'Folder') return null;

	for (const attribute of element.openingElement.attributes) {
		if (
			attribute.type !== 'JSXAttribute' ||
			attribute.name.type !== 'JSXIdentifier' ||
			attribute.name.name !== 'name'
		) {
			continue;
		}

		if (attribute.value?.type === 'StringLiteral') {
			return attribute.value.value;
		}

		if (
			attribute.value?.type === 'JSXExpressionContainer' &&
			attribute.value.expression.type === 'StringLiteral'
		) {
			return attribute.value.expression.value;
		}
	}

	return null;
};

export const getRegistrationInsertionSourceEdit = ({
	input,
	ast,
	insertion,
	folder,
}: {
	input: string;
	ast: File;
	insertion: JSXElement;
	folder: FolderReference | null;
}): SourceEdit => {
	let root: JSXElement | JSXFragment | null = null;
	if (folder) {
		const folders: string[] = [];
		const matches: JSXElement[] = [];
		recast.visit(ast, {
			visitJSXElement(path) {
				const element = path.node as JSXElement;
				const name = getFolderNameFromJSXElement(element, ast);
				if (name !== null) {
					if (
						name === folder.name &&
						(folders.join('/') || null) === folder.parentName
					) {
						matches.push(element);
					}

					folders.push(name);
				}

				this.traverse(path);
				if (name !== null) {
					folders.pop();
				}

				return false;
			},
		});
		if (matches.length !== 1) {
			throw new Error(
				`Expected one folder matching ${JSON.stringify(folder)}, found ${matches.length}`,
			);
		}

		root = matches[0];
	} else {
		const functions = new Map<
			object,
			{path: recast.types.NodePath; hasRegistration: boolean}
		>();
		recast.visit(ast, {
			visitNode(path) {
				const {node} = path as unknown as {node: Node};
				if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
					let parent = path.parentPath;
					while (parent) {
						if (recast.types.namedTypes.Function.check(parent.node)) {
							functions.set(parent.node, {
								path: parent,
								hasRegistration:
									functions.get(parent.node)?.hasRegistration === true ||
									getRegistrationComponentType(node, ast) !== null,
							});
							break;
						}

						parent = parent.parentPath;
					}
				}

				this.traverse(path);
				return false;
			},
		});
		// A JSX callback inside a registration component is part of that
		// component's tree. Insert once in its outer return, not inside the callback.
		const outerFunctions = [...functions.values()].filter((candidate) => {
			let parent = candidate.path.parentPath;
			let nested = false;
			while (parent) {
				const outer = functions.get(parent.node);
				if (outer) {
					nested = true;
					outer.hasRegistration ||= candidate.hasRegistration;
				}

				parent = parent.parentPath;
			}

			return !nested;
		});
		const registered = outerFunctions.filter(
			({hasRegistration}) => hasRegistration,
		);
		const candidates = registered.length > 0 ? registered : outerFunctions;
		if (candidates.length !== 1) {
			throw new Error(
				'Adding registrations requires a single JSX component containing registrations, or a file with a single JSX component',
			);
		}

		const target = candidates[0].path.node;
		const roots: (JSXElement | JSXFragment)[] = [];
		recast.visit(target as never, {
			visitNode(path) {
				const {node} = path as unknown as {node: Node};
				if (recast.types.namedTypes.Function.check(node) && node !== target) {
					return false;
				}

				const returned =
					node.type === 'ReturnStatement'
						? node.argument
						: node.type === 'ArrowFunctionExpression'
							? node.body
							: null;
				if (
					returned?.type === 'JSXElement' ||
					returned?.type === 'JSXFragment'
				) {
					roots.push(returned as JSXElement | JSXFragment);
					return false;
				}

				this.traverse(path);
				return false;
			},
		});
		if (roots.length === 0) {
			throw new Error(
				'Adding registrations requires a JSX return in the registration component',
			);
		}

		root = roots[0];
	}

	return getInsertionRootSourceEdit({
		input,
		insertion: printInsertedJsx({
			compactLiteralProps: false,
			element: insertion as never,
			input,
			prettierConfigOverride: null,
		}),
		root: root as never,
		nullRoot: null,
		prettierConfigOverride: null,
		insertInside: folder !== null || root.type === 'JSXFragment',
	});
};

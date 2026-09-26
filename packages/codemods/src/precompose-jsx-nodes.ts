import {
	isReferenced,
	type File,
	type JSXElement,
	type JSXFragment,
	type Node,
} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {addComposition} from './add-composition';
import type {CodemodProject} from './codemod-project';
import {
	assertNewCompositionId,
	requireComposition,
	validateMetadata,
	type CompositionMetadata,
} from './composition-editing';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {getNodeProps} from './get-node-props';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	type NodeReference,
	type NodeSourceEdit,
} from './node-references';
import {recastLocToOffset} from './recast-loc-to-offset';
import {ensureNamedImport, getImportedName} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
} from './source-edits';
import {getEndOfLine, getIndentationUnit, getLineIndent} from './source-style';

type PrecompositionPlan = {
	ast: File;
	children: JSXFragment['children'];
	end: number;
	firstIndex: number;
	hookProps: {name: string; hookName: string; kind: 'frame' | 'duration'}[];
	logLine: number;
	parent: JSXElement | JSXFragment | null;
	rootPath: recast.types.NodePath | null;
	sequenceName: string | null;
	selectedSequence: JSXElement | null;
	sequenceDuration: number | null;
	start: number;
};

const getPrecompositionPlan = ({
	input,
	nodePaths,
}: {
	input: string;
	nodePaths: SequenceNodePath[];
}): PrecompositionPlan => {
	if (nodePaths.length === 0) {
		throw new Error('Select at least one sequence to pre-compose');
	}

	const uniquePaths = new Set(nodePaths.map((path) => JSON.stringify(path)));
	if (uniquePaths.size !== nodePaths.length) {
		throw new Error('A sequence was selected more than once');
	}

	const ast = parseAst(input);
	const selectedPaths = nodePaths.map((nodePath) => {
		const path = findJsxElementPathForDeletion(ast, nodePath);
		if (!path || !(path.node as JSXElement).loc) {
			throw new Error('Could not identify every selected JSX sequence');
		}

		const element = path.node as JSXElement;
		if (
			element.openingElement.attributes.some(
				(attribute) =>
					attribute.type === 'JSXSpreadAttribute' ||
					(attribute.name.type === 'JSXIdentifier' &&
						attribute.name.name === 'key'),
			)
		) {
			throw new Error(
				'Sequences with a key or spread props cannot be pre-composed safely',
			);
		}

		return path;
	});
	let expression = selectedPaths[0].node;
	let enclosingPath = selectedPaths[0].parentPath;
	while (
		enclosingPath?.node.type === 'ParenthesizedExpression' &&
		enclosingPath.node.expression === expression
	) {
		expression = enclosingPath.node;
		enclosingPath = enclosingPath.parentPath;
	}

	const enclosingNode = enclosingPath?.node;
	const parent =
		enclosingNode?.type === 'JSXElement' ||
		enclosingNode?.type === 'JSXFragment'
			? enclosingNode
			: null;
	const rootPath = parent === null ? selectedPaths[0] : null;
	const isSingleDirectReturn =
		nodePaths.length === 1 &&
		enclosingNode?.type === 'ReturnStatement' &&
		enclosingNode.argument === expression;
	const isSingleArrowBody =
		nodePaths.length === 1 &&
		enclosingNode?.type === 'ArrowFunctionExpression' &&
		enclosingNode.body === expression;
	if (
		(parent === null && !isSingleDirectReturn && !isSingleArrowBody) ||
		(parent !== null &&
			selectedPaths.some((path) => path.parentPath?.node !== enclosingNode))
	) {
		throw new Error('Selected sequences must have the same JSX parent');
	}

	if (parent === null) {
		let functionPath = enclosingPath;
		if (isSingleDirectReturn) {
			functionPath = functionPath?.parentPath;
			while (functionPath?.node.type === 'BlockStatement') {
				functionPath = functionPath.parentPath;
			}
		}

		const functionNode = functionPath?.node;
		const isTopLevelFunction =
			functionNode?.type === 'FunctionDeclaration' &&
			ast.program.body.some(
				(statement) =>
					(statement === functionNode &&
						Boolean(functionNode.id && /^[A-Z]/.test(functionNode.id.name))) ||
					((statement.type === 'ExportNamedDeclaration' ||
						statement.type === 'ExportDefaultDeclaration') &&
						statement.declaration === functionNode &&
						(statement.type === 'ExportDefaultDeclaration' ||
							Boolean(functionNode.id && /^[A-Z]/.test(functionNode.id.name)))),
			);
		const isTopLevelArrow =
			functionNode?.type === 'ArrowFunctionExpression' &&
			ast.program.body.some((statement) => {
				if (
					statement.type === 'ExportDefaultDeclaration' &&
					statement.declaration === functionNode
				) {
					return true;
				}

				const declaration =
					statement.type === 'ExportNamedDeclaration'
						? statement.declaration
						: statement;
				return (
					declaration?.type === 'VariableDeclaration' &&
					declaration.kind === 'const' &&
					declaration.declarations.some(
						(item) =>
							item.init === functionNode &&
							item.id.type === 'Identifier' &&
							/^[A-Z]/.test(item.id.name),
					)
				);
			});
		if (!isTopLevelFunction && !isTopLevelArrow) {
			throw new Error('The sequence is not directly returned by a component');
		}
	}

	const transparentNamedParents = new Set<string>();
	const remotionNamespaces = new Set<string>();
	const remotionImports = new Map<string, string>();
	const transitionNamespaces = new Set<string>();
	const transitionSeriesNames = new Set<string>();
	const transitionSeriesMembers = new Set([
		'Overlay',
		'Sequence',
		'Transition',
	]);
	const staticFileNames = new Set<string>();
	const importedNames = new Set<string>();
	const stablePrimitiveNames = new Set<string>();
	const stableComponentNames = new Set<string>();
	for (const statement of ast.program.body) {
		const valueDeclaration =
			statement.type === 'ExportNamedDeclaration' ||
			statement.type === 'ExportDefaultDeclaration'
				? statement.declaration
				: statement;
		if (
			valueDeclaration?.type === 'FunctionDeclaration' &&
			valueDeclaration.id
		) {
			stableComponentNames.add(valueDeclaration.id.name);
		}

		if (
			valueDeclaration?.type === 'VariableDeclaration' &&
			valueDeclaration.kind === 'const'
		) {
			for (const declaration of valueDeclaration.declarations) {
				if (declaration.id.type !== 'Identifier' || !declaration.init) {
					continue;
				}

				stableComponentNames.add(declaration.id.name);
				if (
					[
						'StringLiteral',
						'NumericLiteral',
						'BooleanLiteral',
						'NullLiteral',
						'BigIntLiteral',
					].includes(declaration.init.type) ||
					(declaration.init.type === 'UnaryExpression' &&
						declaration.init.operator === '-' &&
						declaration.init.argument.type === 'NumericLiteral')
				) {
					stablePrimitiveNames.add(declaration.id.name);
				}
			}
		}

		if (
			statement.type === 'ImportDeclaration' &&
			statement.importKind !== 'type'
		) {
			for (const specifier of statement.specifiers ?? []) {
				if (
					specifier.type !== 'ImportSpecifier' ||
					specifier.importKind !== 'type'
				) {
					importedNames.add(specifier.local.name);
				}

				if (statement.source.value === '@remotion/transitions') {
					if (specifier.type === 'ImportNamespaceSpecifier') {
						transitionNamespaces.add(specifier.local.name);
					} else if (
						specifier.type === 'ImportSpecifier' &&
						specifier.importKind !== 'type' &&
						getImportedName(specifier) === 'TransitionSeries'
					) {
						transitionSeriesNames.add(specifier.local.name);
					}
				}
			}
		}

		if (
			statement.type !== 'ImportDeclaration' ||
			statement.source.value !== 'remotion' ||
			statement.importKind === 'type'
		) {
			continue;
		}

		for (const specifier of statement.specifiers ?? []) {
			if (specifier.type === 'ImportNamespaceSpecifier') {
				remotionNamespaces.add(specifier.local.name);
			} else if (
				specifier.type === 'ImportSpecifier' &&
				specifier.importKind !== 'type'
			) {
				const imported = getImportedName(specifier);
				remotionImports.set(specifier.local.name, imported);
				if (imported === 'Sequence' || imported === 'AbsoluteFill') {
					transparentNamedParents.add(specifier.local?.name ?? imported);
				}

				if (imported === 'staticFile') {
					staticFileNames.add(specifier.local?.name ?? imported);
				}
			}
		}
	}

	const sequenceBinding = [...remotionImports].find(
		([, imported]) => imported === 'Sequence',
	)?.[0];
	if (
		sequenceBinding &&
		selectedPaths.some(
			(path) => path.scope.lookup(sequenceBinding)?.path.node !== ast.program,
		)
	) {
		throw new Error('The Remotion Sequence import is shadowed');
	}

	let ancestor = selectedPaths[0].parentPath;
	let foundTransparentParent = false;
	let foundReturn = false;
	while (ancestor) {
		const ancestorNode = ancestor.node;
		if (ancestorNode.type === 'JSXElement') {
			const {name} = ancestorNode.openingElement;
			const transparent =
				(name.type === 'JSXIdentifier' &&
					(/^[a-z]/.test(name.name) ||
						(transparentNamedParents.has(name.name) &&
							ancestor.scope.lookup(name.name)?.path.node === ast.program))) ||
				(name.type === 'JSXMemberExpression' &&
					name.object.type === 'JSXIdentifier' &&
					remotionNamespaces.has(name.object.name) &&
					ancestor.scope.lookup(name.object.name)?.path.node === ast.program &&
					(name.property.name === 'Sequence' ||
						name.property.name === 'AbsoluteFill'));
			if (!transparent) {
				throw new Error('The JSX parent may depend on its direct children');
			}

			foundTransparentParent = true;
			break;
		}

		if (
			ancestorNode.type === 'ReturnStatement' ||
			ancestorNode.type === 'ArrowFunctionExpression'
		) {
			foundReturn = true;
		} else if (
			foundReturn &&
			ancestorNode.type !== 'BlockStatement' &&
			ancestorNode.type !== 'FunctionDeclaration' &&
			ancestorNode.type !== 'VariableDeclarator' &&
			ancestorNode.type !== 'VariableDeclaration' &&
			ancestorNode.type !== 'ExportNamedDeclaration' &&
			ancestorNode.type !== 'ExportDefaultDeclaration' &&
			ancestorNode.type !== 'Program' &&
			ancestorNode.type !== 'File'
		) {
			throw new Error('The JSX fragment is not directly returned or rendered');
		} else if (
			!foundReturn &&
			ancestorNode.type !== 'JSXFragment' &&
			ancestorNode.type !== 'JSXExpressionContainer' &&
			ancestorNode.type !== 'ParenthesizedExpression'
		) {
			throw new Error('The JSX fragment is not directly returned or rendered');
		}

		ancestor = ancestor.parentPath;
	}

	if (!foundTransparentParent && !foundReturn) {
		throw new Error('The JSX fragment is not directly returned or rendered');
	}

	let firstIndex = 0;
	let children: JSXFragment['children'] = [selectedPaths[0].node as JSXElement];
	if (parent !== null) {
		const indices = selectedPaths
			.map((path) => parent.children.indexOf(path.node as JSXElement))
			.sort((a, b) => a - b);
		if (indices.some((index) => index === -1)) {
			throw new Error('Selected sequences must be direct JSX children');
		}

		firstIndex = indices[0];
		const lastIndex = indices[indices.length - 1];
		const selectedNodes = new Set(selectedPaths.map((path) => path.node));
		if (selectedNodes.size !== selectedPaths.length) {
			throw new Error('A sequence was selected more than once');
		}

		for (let index = firstIndex; index <= lastIndex; index++) {
			const child = parent.children[index];
			if (child.type === 'JSXElement' && selectedNodes.has(child)) {
				continue;
			}

			if (
				child.type === 'JSXText' &&
				child.value.trim() === '' &&
				/\r?\n/.test(child.value)
			) {
				continue;
			}

			throw new Error('Selected sequences must be contiguous JSX siblings');
		}

		children = parent.children.slice(firstIndex, lastIndex + 1);
	}

	let unsafeReason: string | null = null;
	// Captured hook values are passed from the original render. The extracted
	// component falls back to its own hooks when opened as a composition.
	const hookProps = new Map<
		string,
		{name: string; hookName: string; kind: 'frame' | 'duration'}
	>();
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
	for (const path of selectedPaths) {
		recast.visit(path as unknown as Parameters<typeof recast.visit>[0], {
			visitIdentifier(p) {
				if (
					isReferenced(
						p.node as Node,
						p.parentPath.node as Node,
						p.parentPath.parentPath?.node as Node | undefined,
					)
				) {
					const binding = p.scope.lookup(p.node.name);
					const remotionImport =
						binding?.path.node === ast.program
							? remotionImports.get(p.node.name)
							: undefined;
					const isInterpolating =
						remotionImport === 'interpolate' &&
						p.parentPath.node.type === 'CallExpression' &&
						p.parentPath.node.callee === p.node;
					const isEasingMember =
						remotionImport === 'Easing' &&
						p.parentPath.node.type === 'MemberExpression' &&
						p.parentPath.node.object === p.node &&
						!p.parentPath.node.computed &&
						p.parentPath.node.property.type === 'Identifier' &&
						easingMethods.has(p.parentPath.node.property.name);
					const isStaticFileCallee =
						staticFileNames.has(p.node.name) &&
						p.parentPath.node.type === 'CallExpression' &&
						p.parentPath.node.callee === p.node;
					const isStaticFileNamespace =
						remotionNamespaces.has(p.node.name) &&
						p.parentPath.node.type === 'MemberExpression' &&
						p.parentPath.node.object === p.node &&
						!p.parentPath.node.computed &&
						p.parentPath.node.property.type === 'Identifier' &&
						p.parentPath.node.property.name === 'staticFile';
					let hookProp: {
						name: string;
						hookName: string;
						kind: 'frame' | 'duration';
					} | null = null;
					const functionNode = binding?.path.node as Node | undefined;
					if (
						p.node.name !== 'key' &&
						p.node.name !== 'ref' &&
						functionNode &&
						(functionNode.type === 'FunctionDeclaration' ||
							functionNode.type === 'FunctionExpression' ||
							functionNode.type === 'ArrowFunctionExpression') &&
						functionNode.body.type === 'BlockStatement'
					) {
						functionNode.body.body.some(
							(statement) =>
								statement.type === 'VariableDeclaration' &&
								statement.kind === 'const' &&
								statement.declarations.some((declaration) => {
									const {init} = declaration;
									if (
										init?.type !== 'CallExpression' ||
										init.callee.type !== 'Identifier' ||
										init.arguments.length !== 0 ||
										p.scope.lookup(init.callee.name)?.path.node !== ast.program
									) {
										return false;
									}

									const hook = remotionImports.get(init.callee.name);
									if (hook === 'useCurrentFrame') {
										const isMatchingFrame =
											declaration.id.type === 'Identifier' &&
											declaration.id.name === p.node.name;
										if (isMatchingFrame) {
											hookProp = {
												name: p.node.name,
												hookName: init.callee.name,
												kind: 'frame',
											};
										}

										return isMatchingFrame;
									}

									if (
										hook !== 'useVideoConfig' ||
										declaration.id.type !== 'ObjectPattern'
									) {
										return false;
									}

									const matches = declaration.id.properties.some(
										(property) =>
											property.type === 'ObjectProperty' &&
											!property.computed &&
											property.key.type === 'Identifier' &&
											property.key.name === 'durationInFrames' &&
											property.value.type === 'Identifier' &&
											property.value.name === p.node.name,
									);
									if (matches) {
										hookProp = {
											name: p.node.name,
											hookName: init.callee.name,
											kind: 'duration',
										};
									}

									return matches;
								}),
						);
					}

					if (hookProp !== null) {
						hookProps.set(p.node.name, hookProp);
					}

					if (
						!(
							binding?.path.node === ast.program &&
							(stablePrimitiveNames.has(p.node.name) ||
								isStaticFileCallee ||
								isStaticFileNamespace ||
								isInterpolating ||
								isEasingMember)
						) &&
						!hookProp &&
						!(
							binding === undefined &&
							['undefined', 'Infinity', 'NaN'].includes(p.node.name)
						)
					) {
						unsafeReason = `The selected JSX reads ${p.node.name} from an unstable scope`;
					}
				}

				this.traverse(p);
			},
			visitJSXIdentifier(p) {
				if (
					isReferenced(
						p.node as Node,
						p.parentPath.node as Node,
						p.parentPath.parentPath?.node as Node | undefined,
					) &&
					!/^[a-z]/.test(p.node.name)
				) {
					const isSimpleTag =
						p.parentPath.node.type === 'JSXOpeningElement' ||
						p.parentPath.node.type === 'JSXClosingElement';
					const memberNames: string[] = [];
					let memberNode: Node = p.node as Node;
					let memberPath = p.parentPath;
					while (
						memberPath?.node.type === 'JSXMemberExpression' &&
						memberPath.node.object === memberNode
					) {
						memberNames.push(memberPath.node.property.name);
						memberNode = memberPath.node as Node;
						memberPath = memberPath.parentPath;
					}

					const isMemberTag =
						memberNames.length > 0 &&
						(memberPath?.node.type === 'JSXOpeningElement' ||
							memberPath?.node.type === 'JSXClosingElement') &&
						memberPath.node.name === memberNode;
					const remotionImport = remotionImports.get(p.node.name);
					const isNamedRemotionMember =
						memberNames.length === 1 &&
						((remotionImport === 'Interactive' &&
							/^[A-Z]/.test(memberNames[0])) ||
							(remotionImport === 'Series' && memberNames[0] === 'Sequence'));
					const isNamedTransitionMember =
						transitionSeriesNames.has(p.node.name) &&
						memberNames.length === 1 &&
						transitionSeriesMembers.has(memberNames[0]);
					const isRemotionNamespaceMember =
						remotionNamespaces.has(p.node.name) &&
						(memberNames.length === 1 ||
							(memberNames.length === 2 &&
								((memberNames[0] === 'Interactive' &&
									/^[A-Z]/.test(memberNames[1])) ||
									(memberNames[0] === 'Series' &&
										memberNames[1] === 'Sequence'))));
					const isTransitionNamespaceMember =
						transitionNamespaces.has(p.node.name) &&
						memberNames[0] === 'TransitionSeries' &&
						(memberNames.length === 1 ||
							(memberNames.length === 2 &&
								transitionSeriesMembers.has(memberNames[1])));
					const isKnownMemberTag =
						isMemberTag &&
						(isNamedRemotionMember ||
							isNamedTransitionMember ||
							isRemotionNamespaceMember ||
							isTransitionNamespaceMember);
					if (
						p.scope.lookup(p.node.name)?.path.node !== ast.program ||
						(!(
							isSimpleTag &&
							(importedNames.has(p.node.name) ||
								stableComponentNames.has(p.node.name))
						) &&
							!isKnownMemberTag)
					) {
						unsafeReason = `The selected JSX uses ${p.node.name} from an unstable scope`;
					}
				}

				this.traverse(p);
			},
			visitJSXNamespacedName() {
				unsafeReason = 'Namespaced JSX cannot be pre-composed safely';
				return false;
			},
			visitThisExpression() {
				unsafeReason = 'JSX using this cannot be pre-composed safely';
				return false;
			},
			visitSuper() {
				unsafeReason = 'JSX using super cannot be pre-composed safely';
				return false;
			},
			visitMetaProperty() {
				unsafeReason =
					'JSX using meta properties cannot be pre-composed safely';
				return false;
			},
			visitAwaitExpression() {
				unsafeReason = 'JSX using await cannot be pre-composed safely';
				return false;
			},
			visitYieldExpression() {
				unsafeReason = 'JSX using yield cannot be pre-composed safely';
				return false;
			},
			visitCallExpression(p) {
				const {callee, arguments: args} = p.node;
				const isNamedInterpolate =
					callee.type === 'Identifier' &&
					remotionImports.get(callee.name) === 'interpolate' &&
					p.scope.lookup(callee.name)?.path.node === ast.program;
				const isEasingMethod =
					callee.type === 'MemberExpression' &&
					!callee.computed &&
					callee.object.type === 'Identifier' &&
					callee.property.type === 'Identifier' &&
					easingMethods.has(callee.property.name) &&
					remotionImports.get(callee.object.name) === 'Easing' &&
					p.scope.lookup(callee.object.name)?.path.node === ast.program;
				const isNamedStaticFile =
					callee.type === 'Identifier' &&
					staticFileNames.has(callee.name) &&
					p.scope.lookup(callee.name)?.path.node === ast.program;
				const isNamespacedStaticFile =
					callee.type === 'MemberExpression' &&
					!callee.computed &&
					callee.object.type === 'Identifier' &&
					callee.property.type === 'Identifier' &&
					callee.property.name === 'staticFile' &&
					remotionNamespaces.has(callee.object.name) &&
					p.scope.lookup(callee.object.name)?.path.node === ast.program;
				const isSafeStaticFile =
					(isNamedStaticFile || isNamespacedStaticFile) &&
					args.length === 1 &&
					args[0].type === 'StringLiteral';
				if (!isSafeStaticFile && !isNamedInterpolate && !isEasingMethod) {
					unsafeReason =
						'The selected JSX contains a call that may change behavior';
				}

				this.traverse(p);
			},
			visitOptionalCallExpression() {
				unsafeReason =
					'The selected JSX contains a call that may change behavior';
				return false;
			},
			visitNewExpression() {
				unsafeReason = 'The selected JSX contains a constructor call';
				return false;
			},
			visitAssignmentExpression() {
				unsafeReason = 'The selected JSX contains an assignment';
				return false;
			},
			visitUpdateExpression() {
				unsafeReason = 'The selected JSX contains an update expression';
				return false;
			},
			visitTaggedTemplateExpression() {
				unsafeReason = 'The selected JSX contains a tagged template';
				return false;
			},
			visitArrowFunctionExpression() {
				unsafeReason = 'The selected JSX contains a function';
				return false;
			},
			visitFunctionExpression() {
				unsafeReason = 'The selected JSX contains a function';
				return false;
			},
			visitObjectMethod() {
				unsafeReason = 'The selected JSX contains a function';
				return false;
			},
			visitClassExpression() {
				unsafeReason = 'The selected JSX contains a class';
				return false;
			},
			visitTemplateLiteral(p) {
				if (p.node.loc?.start.line !== p.node.loc?.end.line) {
					unsafeReason = 'The selected JSX contains a multiline template';
				}

				this.traverse(p);
			},
			visitStringLiteral(p) {
				if (p.node.loc?.start.line !== p.node.loc?.end.line) {
					unsafeReason = 'The selected JSX contains a multiline string';
				}

				this.traverse(p);
			},
			visitJSXText(p) {
				if (
					p.node.loc?.start.line !== p.node.loc?.end.line &&
					p.node.value.split(/\r?\n/).filter((line) => line.trim().length > 0)
						.length > 1
				) {
					unsafeReason = 'The selected JSX contains multiline text';
				}

				this.traverse(p);
			},
		});
	}

	if (unsafeReason !== null) {
		throw new Error(unsafeReason);
	}

	if (
		hookProps.size > 0 &&
		[...hookProps.values()].some((prop) => prop.kind === 'frame')
	) {
		let frameAncestor = selectedPaths[0].parentPath;
		while (frameAncestor) {
			if (frameAncestor.node.type === 'JSXElement') {
				const {name} = frameAncestor.node.openingElement;
				const isSequence =
					(name.type === 'JSXIdentifier' &&
						(remotionImports.get(name.name) === 'Sequence' ||
							name.name === 'Sequence')) ||
					(name.type === 'JSXMemberExpression' &&
						name.property.name === 'Sequence');
				if (isSequence) {
					throw new Error(
						'The selected markup captures a frame outside its sequence',
					);
				}
			}

			frameAncestor = frameAncestor.parentPath;
		}
	}

	const selectedElement = selectedPaths[0].node as JSXElement;
	const selectedTag = selectedElement.openingElement.name;
	const selectedSequence =
		nodePaths.length === 1 &&
		selectedTag.type === 'JSXIdentifier' &&
		remotionImports.get(selectedTag.name) === 'Sequence'
			? selectedElement
			: null;
	let sequenceDuration: number | null = null;
	if (selectedSequence) {
		if (
			!selectedSequence.closingElement?.loc ||
			selectedSequence.children.length === 0 ||
			selectedSequence.children.some(
				(child) => child.type === 'JSXText' && child.value.trim() !== '',
			)
		) {
			throw new Error('The selected sequence has no extractable JSX children');
		}

		let hasDuration = false;
		let hasNonzeroFrom = false;
		for (const attribute of selectedSequence.openingElement.attributes) {
			if (
				attribute.type !== 'JSXAttribute' ||
				attribute.name.type !== 'JSXIdentifier'
			) {
				throw new Error('The selected sequence has unsupported props');
			}

			const key = attribute.name.name;
			if (!['name', 'from', 'durationInFrames', 'layout'].includes(key)) {
				throw new Error('The selected sequence has unsupported props');
			}

			if (key !== 'from' && key !== 'durationInFrames') {
				continue;
			}

			const value =
				attribute.value?.type === 'JSXExpressionContainer' &&
				attribute.value.expression.type === 'NumericLiteral'
					? attribute.value.expression.value
					: null;
			if (value === null || !Number.isInteger(value) || value < 0) {
				throw new Error('The selected sequence timing is not static');
			}

			if (key === 'from') {
				hasNonzeroFrom = value !== 0;
			} else {
				if (value === 0) {
					throw new Error('The selected sequence has no duration');
				}

				hasDuration = true;
				sequenceDuration = value;
			}
		}

		if (!hasDuration && hasNonzeroFrom) {
			throw new Error('The selected sequence duration is not explicit');
		}

		if (
			hasNonzeroFrom &&
			[...hookProps.values()].some((prop) => prop.kind === 'frame')
		) {
			throw new Error(
				'The selected sequence captures a frame before its start',
			);
		}

		children = [...selectedSequence.children];
	}

	const first = children[0];
	const last = children[children.length - 1];
	if (!selectedSequence && (!first.loc || !last.loc)) {
		throw new Error('Could not locate every selected JSX sequence');
	}

	const sequenceStart = selectedSequence?.openingElement.loc?.end;
	const sequenceEnd = selectedSequence?.closingElement?.loc?.start;
	if (selectedSequence && (!sequenceStart || !sequenceEnd)) {
		throw new Error('Could not locate the selected sequence contents');
	}

	return {
		ast,
		children,
		end: recastLocToOffset(input, sequenceEnd ?? last.loc!.end),
		firstIndex,
		hookProps: [...hookProps.values()].sort((left, right) =>
			left.name.localeCompare(right.name),
		),
		logLine: selectedSequence?.loc?.start.line ?? first.loc!.start.line,
		parent,
		rootPath,
		selectedSequence,
		sequenceDuration,
		sequenceName:
			nodePaths.length === 1
				? ((
						selectedPaths[0].node as JSXElement
					).openingElement.attributes.flatMap((attribute) =>
						attribute.type === 'JSXAttribute' &&
						attribute.name.type === 'JSXIdentifier' &&
						attribute.name.name === 'name' &&
						attribute.value?.type === 'StringLiteral'
							? [attribute.value.value]
							: [],
					)[0] ?? null)
				: null,
		start: recastLocToOffset(input, sequenceStart ?? first.loc!.start),
	};
};

type PrecomposeOptions<Project extends CodemodProject> = {
	project: Project;
	nodes: NodeReference[];
	compositionFile: string;
	compositionId: string;
	metadata: CompositionMetadata;
	existingCompositionIds: string[];
};

const getRegistrationPathChanges = ({
	before,
	after,
	compositionId,
}: {
	before: string;
	after: string;
	compositionId: string;
}) => {
	const original = captureJsxNodePaths(parseAst(before));
	const updated = captureJsxNodePaths(parseAst(after));
	const inserted = updated.filter(({node: {attributes}}) => {
		return (
			attributes.some(
				(attribute) =>
					attribute.type === 'JSXAttribute' &&
					attribute.name.type === 'JSXIdentifier' &&
					attribute.name.name === 'id' &&
					attribute.value?.type === 'StringLiteral' &&
					attribute.value.value === compositionId,
			) &&
			attributes.some(
				(attribute) =>
					attribute.type === 'JSXAttribute' &&
					attribute.name.type === 'JSXIdentifier' &&
					attribute.name.name === 'component',
			)
		);
	});
	if (inserted.length !== 1 || updated.length !== original.length + 1) {
		throw new Error('Could not track the new composition registration');
	}

	const preserved = updated.filter((entry) => entry !== inserted[0]);
	const byOriginalPath = new Map<string, SequenceNodePath>();
	for (let index = 0; index < original.length; index++) {
		if (original[index].signature !== preserved[index].signature) {
			throw new Error('Composition registration changed unrelated JSX');
		}

		byOriginalPath.set(
			JSON.stringify(original[index].nodePath),
			preserved[index].nodePath,
		);
	}

	return {original, byOriginalPath, insertedPath: inserted[0].nodePath};
};

export const precomposeJsxNodes = <Project extends CodemodProject>({
	project,
	nodes,
	compositionFile,
	compositionId,
	metadata,
	existingCompositionIds,
}: PrecomposeOptions<Project>) => {
	if (nodes.length === 0) {
		throw new Error('Select at least one sequence to pre-compose');
	}

	validateMetadata(metadata);
	const filePath = findProjectFile({project, filePath: nodes[0].filePath});
	const registrationFile = findProjectFile({
		project,
		filePath: compositionFile,
	});
	if (
		nodes.some(
			(node) =>
				findProjectFile({project, filePath: node.filePath}) !== filePath,
		)
	) {
		throw new Error('Selected sequences must be in one source file');
	}

	const parentComposition = requireComposition({
		project,
		compositionFile: registrationFile,
		compositionId,
	});
	const parentMetadata = getNodeProps({
		project,
		node: parentComposition,
		keys: ['width', 'height', 'fps', 'durationInFrames'],
	}).props;
	for (const key of ['width', 'height', 'fps', 'durationInFrames'] as const) {
		const value = parentMetadata[key];
		if (value.status !== 'static' || value.codeValue !== metadata[key]) {
			throw new Error('The parent composition metadata is not static');
		}
	}

	const input = project.files[filePath];
	const {
		ast,
		children,
		end,
		firstIndex,
		hookProps,
		logLine,
		parent,
		rootPath,
		sequenceName,
		selectedSequence,
		sequenceDuration,
		start,
	} = getPrecompositionPlan({
		input,
		nodePaths: nodes.map((node) => node.nodePath),
	});
	if (
		sequenceDuration !== null &&
		sequenceDuration !== metadata.durationInFrames
	) {
		throw new Error('The selected sequence uses a different video duration');
	}

	const captured = captureJsxNodePaths(ast);
	const registrationAst =
		registrationFile === filePath
			? ast
			: parseAst(project.files[registrationFile]);
	const occupiedNames = new Set<string>();
	for (const candidateAst of new Set([ast, registrationAst])) {
		recast.visit(candidateAst, {
			visitIdentifier(path) {
				occupiedNames.add(path.node.name);
				this.traverse(path);
			},
			visitJSXIdentifier(path) {
				occupiedNames.add(path.node.name);
				this.traverse(path);
			},
		});
	}

	const labelWords = sequenceName?.match(/[A-Za-z][A-Za-z0-9]*/g) ?? [];
	const baseName =
		labelWords.length === 0
			? 'Precomposition'
			: labelWords
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join('');
	const knownIds = new Set(existingCompositionIds);
	let name: string | null = null;
	for (let suffix = 1; suffix < 10000; suffix++) {
		const candidate = `${baseName}${suffix === 1 ? '' : suffix}`;
		if (occupiedNames.has(candidate) || knownIds.has(candidate)) {
			continue;
		}

		try {
			assertNewCompositionId({
				project,
				compositionFile: registrationFile,
				compositionId: candidate,
			});
			name = candidate;
			break;
		} catch (error) {
			if (!(error as Error).message.includes('already exists')) {
				throw error;
			}
		}
	}

	if (name === null) {
		throw new Error('Could not choose a unique composition name');
	}

	const resolvedHookProps = hookProps.map((prop) => {
		const suffix = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
		let parentAlias = `precomposeParent${suffix}`;
		for (let index = 2; occupiedNames.has(parentAlias); index++) {
			parentAlias = `precomposeParent${suffix}${index}`;
		}

		occupiedNames.add(parentAlias);
		let standaloneAlias = `precomposeStandalone${suffix}`;
		for (let index = 2; occupiedNames.has(standaloneAlias); index++) {
			standaloneAlias = `precomposeStandalone${suffix}${index}`;
		}

		occupiedNames.add(standaloneAlias);
		return {...prop, parentAlias, standaloneAlias};
	});
	const destructuredProps = resolvedHookProps
		.map(({name: propName, parentAlias}) => `${propName}: ${parentAlias}`)
		.join(', ');
	const typedProps = resolvedHookProps
		.map(({name: propName}) => `${propName}?: number | null`)
		.join('; ');
	const parameters =
		resolvedHookProps.length === 0
			? ''
			: `{${destructuredProps}}${filePath.endsWith('.tsx') ? `: {${typedProps}}` : ''}`;
	const signature = `export function ${name}(${parameters}) {`;
	const hookStatements = resolvedHookProps.flatMap(
		({name: propName, parentAlias, standaloneAlias, hookName, kind}) => [
			kind === 'frame'
				? `const ${standaloneAlias} = ${hookName}();`
				: `const ${standaloneAlias} = ${metadata.durationInFrames};`,
			`const ${propName} = ${parentAlias} ?? ${standaloneAlias};`,
		],
	);

	const snapshots = captureImportSnapshots(ast);
	const sequenceImport = [...ast.program.body]
		.filter((statement) => statement.type === 'ImportDeclaration')
		.flatMap((statement) =>
			statement.source.value === 'remotion' && statement.importKind !== 'type'
				? (statement.specifiers ?? []).flatMap((specifier) =>
						specifier.type === 'ImportSpecifier' &&
						specifier.importKind !== 'type' &&
						getImportedName(specifier) === 'Sequence'
							? [specifier.local.name]
							: [],
					)
				: [],
		)[0];
	let sequenceLocalName = sequenceImport;
	if (!sequenceLocalName) {
		sequenceLocalName = 'Sequence';
		for (let suffix = 2; occupiedNames.has(sequenceLocalName); suffix++) {
			sequenceLocalName = `RemotionSequence${suffix}`;
		}
	}

	const sequenceTag = ensureNamedImport({
		ast,
		importedName: 'Sequence',
		sourcePath: 'remotion',
		localName: sequenceLocalName,
	});
	const endOfLine = getEndOfLine(input);
	const unit = getIndentationUnit(input, null);
	const originalIndent = getLineIndent({input, offset: start});
	const wrapperName = sequenceName ?? name;
	const childSource = `<${name}${resolvedHookProps.map(({name: propName}) => ` ${propName}={${propName}}`).join('')} />`;
	const replacementSource = selectedSequence
		? `${endOfLine}${originalIndent}${unit}${childSource}${endOfLine}${originalIndent}`
		: [
				`<${sequenceTag} layout="none" name={${JSON.stringify(wrapperName)}}>`,
				`${originalIndent}${unit}${childSource}`,
				`${originalIndent}</${sequenceTag}>`,
			].join(endOfLine);
	const replacementStatement = parseAst(
		selectedSequence
			? `const replacement = ${childSource};`
			: `const replacement = <${sequenceTag} layout="none" name={${JSON.stringify(wrapperName)}}>${childSource}</${sequenceTag}>;`,
	).program.body[0];
	if (replacementStatement.type !== 'VariableDeclaration') {
		throw new Error('Could not create the pre-composed JSX');
	}

	const replacement = replacementStatement.declarations[0].init;
	if (replacement?.type !== 'JSXElement') {
		throw new Error('Could not create the pre-composed JSX');
	}

	const declarationStatement = parseAst(
		`${signature} ${hookStatements.join(' ')} return <></>; }`,
	).program.body[0];
	if (
		declarationStatement.type !== 'ExportNamedDeclaration' ||
		declarationStatement.declaration?.type !== 'FunctionDeclaration'
	) {
		throw new Error('Could not create the pre-composed component');
	}

	const {declaration} = declarationStatement;
	const returnStatement = declaration.body.body.at(-1);
	if (
		returnStatement?.type !== 'ReturnStatement' ||
		returnStatement.argument?.type !== 'JSXFragment'
	) {
		throw new Error('Could not create the pre-composed fragment');
	}

	returnStatement.argument.children = children;
	if (selectedSequence) {
		selectedSequence.children = [replacement];
	} else if (parent === null) {
		if (!rootPath) {
			throw new Error('Could not replace the selected sequence');
		}

		rootPath.replace(replacement);
	} else {
		parent.children.splice(firstIndex, children.length, replacement);
	}

	ast.program.body.push(declarationStatement);
	const source = input.slice(start, end);
	const sourceLines = source.split(/\r?\n/);
	if (selectedSequence) {
		while (sourceLines[0]?.trim() === '') {
			sourceLines.shift();
		}

		while (sourceLines.at(-1)?.trim() === '') {
			sourceLines.pop();
		}
	}

	const movedIndent = selectedSequence
		? (sourceLines[0]?.match(/^[\t ]*/)?.[0] ?? '')
		: originalIndent;
	const movedSource = sourceLines
		.map((line, index) => {
			const withoutOriginalIndent =
				index === 0 && !selectedSequence
					? line
					: line.startsWith(movedIndent)
						? line.slice(movedIndent.length)
						: line.trimStart();
			return withoutOriginalIndent.length === 0
				? ''
				: `${unit}${unit}${unit}${withoutOriginalIndent}`;
		})
		.join(endOfLine);
	const componentSignature =
		signature.length <= 80 || resolvedHookProps.length === 0
			? signature
			: filePath.endsWith('.tsx')
				? [
						`export function ${name}({`,
						...resolvedHookProps.map(
							({name: propName, parentAlias}) =>
								`${unit}${propName}: ${parentAlias},`,
						),
						`}: {`,
						...resolvedHookProps.map(
							({name: propName}) => `${unit}${propName}?: number | null;`,
						),
						'}) {',
					].join(endOfLine)
				: [
						`export function ${name}({`,
						...resolvedHookProps.map(
							({name: propName, parentAlias}) =>
								`${unit}${propName}: ${parentAlias},`,
						),
						'}) {',
					].join(endOfLine);
	const component = [
		...(resolvedHookProps.length > 0 && !filePath.endsWith('.tsx')
			? [
					`/** @param {{${resolvedHookProps.map(({name: propName}) => `${propName}?: number | null`).join(', ')}}} props */`,
				]
			: []),
		componentSignature,
		...hookStatements.map((statement) => `${unit}${statement}`),
		`${unit}return (`,
		`${unit}${unit}<>`,
		movedSource,
		`${unit}${unit}</>`,
		`${unit});`,
		'}',
	].join(endOfLine);
	const sourceOutput = applySourceEdits({
		input,
		edits: [
			{start, end, replacement: replacementSource},
			{
				start: input.length,
				end: input.length,
				replacement: `${input.endsWith(endOfLine) ? endOfLine : `${endOfLine}${endOfLine}`}${component}${endOfLine}`,
			},
			...getInsertImportSourceEdits({
				ast,
				input,
				snapshots,
				prettierConfigOverride: null,
			}),
		],
	});
	const firstPhase = getNodePathRemappings({
		ast,
		captured,
		output: sourceOutput,
	});
	const wrapperPath = firstPhase.finalNodePathByNode.get(
		(selectedSequence ?? replacement).openingElement,
	);
	if (!wrapperPath) {
		throw new Error('Could not locate the connected sequence');
	}

	const registrationProject = {
		...project,
		files: {...project.files, [filePath]: sourceOutput},
	};
	const registrationDir = registrationFile
		.replaceAll('\\', '/')
		.split('/')
		.slice(0, -1);
	const sourceParts = filePath.replaceAll('\\', '/').split('/');
	while (registrationDir.length > 0 && registrationDir[0] === sourceParts[0]) {
		registrationDir.shift();
		sourceParts.shift();
	}

	const relativeSource = [...registrationDir.map(() => '..'), ...sourceParts]
		.join('/')
		.replace(/\.(?:tsx?|jsx?|mjs)$/, '');
	const importPath =
		registrationFile === filePath
			? null
			: relativeSource.startsWith('.')
				? relativeSource
				: `./${relativeSource}`;
	const registrationResult = addComposition({
		project: registrationProject,
		compositionFile: registrationFile,
		compositionId: name,
		component: {importName: name, importPath},
		metadata: {
			...metadata,
			durationInFrames: sequenceDuration ?? metadata.durationInFrames,
		},
	});
	const registrationOutput = registrationResult.changes.find(
		(change) => change.filePath === registrationFile,
	)?.nextContents;
	if (!registrationOutput) {
		throw new Error('Could not register the pre-composed composition');
	}

	const registrationPaths = getRegistrationPathChanges({
		before:
			registrationFile === filePath
				? sourceOutput
				: project.files[registrationFile],
		after: registrationOutput,
		compositionId: name,
	});
	const selectedPaths = new Set(
		nodes.map((node) => JSON.stringify(node.nodePath)),
	);
	const firstPhaseByOldPath = new Map(
		firstPhase.nodePathRemappings
			.filter((entry) => entry.oldNodePath !== null)
			.map((entry) => [JSON.stringify(entry.oldNodePath), entry.newNodePath]),
	);
	const finalSourcePath = (intermediate: SequenceNodePath) => {
		if (registrationFile !== filePath) {
			return intermediate;
		}

		const path = registrationPaths.byOriginalPath.get(
			JSON.stringify(intermediate),
		);
		if (!path) {
			throw new Error('Could not track the moved sequence');
		}

		return path;
	};

	const sourceRemappings: NodeSourceEdit['nodePathRemappings'] = captured.map(
		({nodePath}) => {
			const oldPath = JSON.stringify(nodePath);
			const intermediate = firstPhaseByOldPath.has(oldPath)
				? firstPhaseByOldPath.get(oldPath)
				: nodePath;
			return {
				oldNodePath: nodePath,
				newNodePath: selectedPaths.has(oldPath)
					? finalSourcePath(wrapperPath)
					: intermediate
						? finalSourcePath(intermediate)
						: null,
			};
		},
	);
	sourceRemappings.push(
		...firstPhase.nodePathRemappings
			.filter(
				(entry): entry is typeof entry & {newNodePath: SequenceNodePath} =>
					entry.oldNodePath === null && entry.newNodePath !== null,
			)
			.map((entry) => ({
				oldNodePath: null,
				newNodePath: finalSourcePath(entry.newNodePath),
			})),
	);
	const sourceOutputFinal =
		registrationFile === filePath ? registrationOutput : sourceOutput;
	const edits: NodeSourceEdit[] = [
		{filePath, output: sourceOutputFinal, nodePathRemappings: sourceRemappings},
	];
	if (registrationFile === filePath) {
		sourceRemappings.push({
			oldNodePath: null,
			newNodePath: registrationPaths.insertedPath,
		});
	} else {
		edits.push({
			filePath: registrationFile,
			output: registrationOutput,
			nodePathRemappings: [
				...registrationPaths.original.map(({nodePath}) => ({
					oldNodePath: nodePath,
					newNodePath: registrationPaths.byOriginalPath.get(
						JSON.stringify(nodePath),
					)!,
				})),
				{oldNodePath: null, newNodePath: registrationPaths.insertedPath},
			],
		});
	}

	return {...getNodeEditResult({project, edits}), logLine};
};

export const canPrecomposeJsxNodes = <Project extends CodemodProject>(
	options: PrecomposeOptions<Project>,
): {canPrecompose: boolean; reason: string | null} => {
	try {
		precomposeJsxNodes(options);
		return {canPrecompose: true, reason: null};
	} catch (error) {
		return {canPrecompose: false, reason: (error as Error).message};
	}
};

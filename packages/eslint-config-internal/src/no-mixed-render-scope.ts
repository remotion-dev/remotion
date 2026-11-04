import type {Rule, Scope} from 'eslint';

export const noMixedRenderScope: Rule.RuleModule = {
	meta: {
		type: 'problem',
		schema: [],
		messages: {
			mixedScope:
				'Use {{name}} from useDelayRender() in this function. The global {{name}} uses a different render scope during web rendering.',
		},
	},
	create: (context) => {
		return {
			'Program:exit': () => {
				const hookScopes = new Set<Scope.Scope>();
				const globalReferences: {
					name: string;
					node: Rule.Node;
					scope: Scope.Scope;
				}[] = [];

				for (const scope of context.sourceCode.scopeManager.scopes) {
					for (const variable of scope.variables) {
						for (const definition of variable.defs) {
							if (
								definition.type !== 'ImportBinding' ||
								definition.parent.type !== 'ImportDeclaration'
							) {
								continue;
							}

							const source = definition.parent.source.value;
							const isCoreImport =
								typeof source === 'string' &&
								source.startsWith('.') &&
								/[/\\]core[/\\]src[/\\]/.test(context.filename) &&
								/\/(cancel-render|delay-render|use-delay-render)(\.js)?$/.test(
									source,
								);
							if (source !== 'remotion' && !isCoreImport) {
								continue;
							}

							for (const reference of variable.references) {
								if (
									!reference.isRead() ||
									('isValueReference' in reference &&
										!reference.isValueReference)
								) {
									continue;
								}

								let node = reference.identifier as Rule.Node;
								// A type query resolves a value binding without using its render scope.
								if (
									context.sourceCode
										.getAncestors(node)
										.some(
											(ancestor) => (ancestor.type as string) === 'TSTypeQuery',
										)
								) {
									continue;
								}

								let name: string;
								if (definition.node.type === 'ImportSpecifier') {
									name =
										definition.node.imported.type === 'Identifier'
											? definition.node.imported.name
											: String(definition.node.imported.value);
								} else if (
									definition.node.type === 'ImportNamespaceSpecifier' &&
									node.parent.type === 'MemberExpression' &&
									node.parent.object === node
								) {
									const member = node.parent;
									if (
										!member.computed &&
										member.property.type === 'Identifier'
									) {
										name = member.property.name;
									} else if (
										member.computed &&
										member.property.type === 'Literal' &&
										typeof member.property.value === 'string'
									) {
										name = member.property.value;
									} else {
										continue;
									}

									node = member;
								} else {
									continue;
								}

								if (name === 'useDelayRender') {
									if (
										node.parent.type !== 'CallExpression' ||
										node.parent.callee !== node
									) {
										continue;
									}

									let owner: Scope.Scope | null = reference.from;
									while (owner && owner.type !== 'function') {
										owner = owner.upper;
									}

									if (owner) {
										hookScopes.add(owner);
									}
								} else if (
									name === 'cancelRender' ||
									name === 'continueRender' ||
									name === 'delayRender'
								) {
									globalReferences.push({name, node, scope: reference.from});
								}
							}
						}
					}
				}

				for (const {name, node, scope} of globalReferences) {
					let owner: Scope.Scope | null = scope;
					while (owner) {
						if (hookScopes.has(owner)) {
							context.report({node, messageId: 'mixedScope', data: {name}});
							break;
						}

						owner = owner.upper;
					}
				}
			},
		};
	},
};

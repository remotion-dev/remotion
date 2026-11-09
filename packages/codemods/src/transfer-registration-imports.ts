import {type File, type ImportDeclaration, type Node} from '@babel/types';
import * as recast from 'recast';
import type {TreeEntry} from './folder-editing';
import {
	relativeVirtualPath,
	resolveVirtualPath,
	virtualDirname,
} from './insert-jsx-element';
import {isReferenced} from './is-referenced';
import {recastLocToOffset} from './recast-loc-to-offset';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
	type SourceEdit,
} from './source-edits';
import {collectReferencedNames} from './unused-imports';

export const transferRegistrationImports = ({
	input,
	ast,
	entry,
	filePath,
	destinationInput,
	destinationAst,
	destinationFile,
}: {
	input: string;
	ast: File;
	entry: TreeEntry;
	filePath: string;
	destinationInput: string;
	destinationAst: File;
	destinationFile: string;
}) => {
	const snapshots = captureImportSnapshots(destinationAst);
	const usedNames = collectReferencedNames(destinationAst);
	const sourceNames = collectReferencedNames(entry.node);
	const scopes = new Set<object>();
	const boundNames = new Set<string>();
	const shadowedNames = new Set<string>();
	recast.visit(destinationAst, {
		visitNode(path) {
			if (path.scope && !scopes.has(path.scope)) {
				scopes.add(path.scope);
				for (const name of [
					...Object.keys(path.scope.getBindings()),
					...Object.keys(path.scope.getTypes()),
				]) {
					boundNames.add(name);
					if (path.scope.path.node !== destinationAst.program)
						shadowedNames.add(name);
				}
			}

			this.traverse(path);
		},
	});
	for (const statement of destinationAst.program.body) {
		if (statement.type === 'ImportDeclaration') {
			for (const specifier of statement.specifiers)
				usedNames.add(specifier.local.name);
		}
	}

	const imports = new Map<
		string,
		{
			declaration: ImportDeclaration;
			specifier: ImportDeclaration['specifiers'][number];
		}
	>();
	for (const declaration of ast.program.body) {
		if (declaration.type !== 'ImportDeclaration') continue;
		for (const specifier of declaration.specifiers)
			imports.set(specifier.local.name, {declaration, specifier});
	}

	const runtimeBindings = new Map<
		string,
		{declaration: recast.types.NodePath; scope: object}[]
	>();
	recast.visit(ast, {
		visitNode(path) {
			const node = path.node as Node;
			if (
				(node.type === 'TSEnumDeclaration' ||
					node.type === 'TSModuleDeclaration') &&
				node.id.type === 'Identifier'
			) {
				const declarations = runtimeBindings.get(node.id.name) ?? [];
				let scope = path.parentPath;
				while (
					scope &&
					![
						'Program',
						'BlockStatement',
						'StaticBlock',
						'TSModuleBlock',
						'SwitchStatement',
					].includes(scope.node.type)
				)
					scope = scope.parentPath;
				if (!scope)
					throw new Error(
						'Could not locate the scope of a TypeScript declaration',
					);
				declarations.push({declaration: path, scope: scope.node});
				runtimeBindings.set(node.id.name, declarations);
			}

			this.traverse(path);
		},
	});

	const names = new Map<string, string>();
	const edits: SourceEdit[] = [];
	const editedOffsets = new Set<number>();
	recast.visit(entry.path as unknown as Parameters<typeof recast.visit>[0], {
		visitNode(p) {
			const node = p.node as Node;
			if (
				node.type === 'ThisExpression' ||
				node.type === 'Super' ||
				node.type === 'MetaProperty'
			) {
				throw new Error(
					'Cannot move a registration using this, super, or import.meta to another file',
				);
			}

			if (
				node.type === 'CallExpression' &&
				(node.callee.type === 'Import' ||
					(node.callee.type === 'Identifier' && node.callee.name === 'require'))
			) {
				const argument = node.arguments[0];
				if (argument?.type !== 'StringLiteral')
					throw new Error(
						'Cannot move a registration with a dynamic module path to another file',
					);
				if (argument.value.startsWith('.') && argument.loc) {
					const relative = relativeVirtualPath(
						virtualDirname(destinationFile),
						resolveVirtualPath(virtualDirname(filePath), argument.value),
					);
					edits.push({
						start: recastLocToOffset(input, argument.loc.start),
						end: recastLocToOffset(input, argument.loc.end),
						replacement: JSON.stringify(
							relative.startsWith('.') ? relative : `./${relative}`,
						),
					});
				}
			}

			this.traverse(p);
		},
		visitIdentifier(p) {
			const node = p.node as Node;
			const parent = p.parentPath.node as Node;
			if (
				!isReferenced(
					node,
					parent,
					p.parentPath.parentPath?.node as Node | undefined,
				)
			)
				return false;
			const {name} = p.node;
			const binding = p.scope.lookup(name) ?? p.scope.lookupType(name);
			let bindingPath = binding?.path ?? null;
			let currentPath: recast.types.NodePath | null = p;
			while (currentPath) {
				const runtimeBinding = runtimeBindings
					.get(name)
					?.find((declaration) => declaration.scope === currentPath?.node);
				if (runtimeBinding) {
					bindingPath = runtimeBinding.declaration;
					break;
				}

				if (bindingPath?.node === currentPath.node) break;
				currentPath = currentPath.parentPath;
			}

			if (bindingPath && bindingPath.node !== ast.program) {
				let ancestor: recast.types.NodePath | null = bindingPath;
				while (ancestor && ancestor.node !== entry.node)
					ancestor = ancestor.parentPath;
				if (ancestor) return false;
				throw new Error(
					`Cannot move a registration that depends on local binding "${name}" to another file. Move that binding to an imported module first.`,
				);
			}

			const imported = imports.get(name);
			if (!imported) {
				if (
					binding ||
					boundNames.has(name) ||
					['arguments', '__dirname', '__filename'].includes(name)
				)
					throw new Error(
						`Cannot move a registration that depends on local binding "${name}" to another file. Move that binding to an imported module first.`,
					);
				return false;
			}

			let localName = names.get(name);
			if (!localName) {
				let source = imported.declaration.source.value;
				if (source.startsWith('.')) {
					const relative = relativeVirtualPath(
						virtualDirname(destinationFile),
						resolveVirtualPath(virtualDirname(filePath), source),
					);
					source = relative.startsWith('.') ? relative : `./${relative}`;
				}

				const matchingDeclaration = destinationAst.program.body.find(
					(statement): statement is ImportDeclaration =>
						statement.type === 'ImportDeclaration' &&
						statement.source.value === source &&
						(statement.importKind ?? 'value') ===
							(imported.declaration.importKind ?? 'value'),
				);
				const matchingSpecifier = matchingDeclaration?.specifiers.find(
					(specifier) => {
						if (
							shadowedNames.has(specifier.local.name) ||
							(specifier.local.name !== name &&
								sourceNames.has(specifier.local.name)) ||
							specifier.type !== imported.specifier.type
						)
							return false;
						if (
							specifier.type === 'ImportSpecifier' &&
							imported.specifier.type === 'ImportSpecifier'
						) {
							return (
								(specifier.imported.type === 'Identifier'
									? specifier.imported.name
									: specifier.imported.value) ===
									(imported.specifier.imported.type === 'Identifier'
										? imported.specifier.imported.name
										: imported.specifier.imported.value) &&
								(specifier.importKind ?? 'value') ===
									(imported.specifier.importKind ?? 'value')
							);
						}

						return true;
					},
				);
				localName = matchingSpecifier?.local.name ?? name;
				if (!matchingSpecifier) {
					let suffix = 2;
					while (
						usedNames.has(localName) ||
						(localName !== name && sourceNames.has(localName))
					)
						localName = `${name}${suffix++}`;
					usedNames.add(localName);
					const specifier = {
						...imported.specifier,
						local: {...imported.specifier.local, name: localName},
					};
					if (
						matchingDeclaration &&
						specifier.type === 'ImportSpecifier' &&
						!matchingDeclaration.specifiers.some(
							(existing) => existing.type === 'ImportNamespaceSpecifier',
						)
					) {
						matchingDeclaration.specifiers.push(specifier);
					} else {
						destinationAst.program.body.unshift({
							...imported.declaration,
							loc: null,
							leadingComments: null,
							trailingComments: null,
							source: {
								...imported.declaration.source,
								value: source,
								extra: undefined,
							},
							specifiers: [specifier],
						});
					}
				}

				names.set(name, localName);
			}

			if (localName !== name && p.node.loc) {
				const start = recastLocToOffset(input, p.node.loc.start);
				if (!editedOffsets.has(start)) {
					editedOffsets.add(start);
					edits.push({
						start,
						end: recastLocToOffset(input, p.node.loc.end),
						replacement:
							parent.type === 'ObjectProperty' && parent.shorthand
								? `${name}: ${localName}`
								: localName,
					});
				}
			}

			return false;
		},
	});
	return {
		input: applySourceEdits({input, edits}),
		localNames: new Set(names.keys()),
		importEdits: getInsertImportSourceEdits({
			ast: destinationAst,
			input: destinationInput,
			snapshots,
			prettierConfigOverride: null,
		}),
	};
};

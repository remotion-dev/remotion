import type {File, ImportDeclaration, ImportSpecifier} from '@babel/types';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {ensureNamedImport, getImportedName} from './sequence-props/imports';
import {parseAst, serializeAst} from './sequence-props/parse-ast';

const protocolPackage = '@remotion/studio-protocol';

const isValueImport = (
	declaration: ImportDeclaration,
	specifier: ImportSpecifier,
) =>
	declaration.importKind !== 'type' &&
	specifier.importKind !== 'type' &&
	getImportedName(specifier) === 'staticFileRef';

const hasTopLevelBinding = (ast: File, name: string) =>
	ast.program.body.some((statement) => {
		if (statement.type === 'ImportDeclaration') {
			return statement.specifiers?.some(
				(specifier) => specifier.local?.name === name,
			);
		}

		const declaration =
			statement.type === 'ExportNamedDeclaration'
				? statement.declaration
				: statement;
		if (
			declaration?.type === 'FunctionDeclaration' ||
			declaration?.type === 'ClassDeclaration'
		) {
			return declaration.id?.name === name;
		}

		if (declaration?.type === 'VariableDeclaration') {
			return declaration.declarations.some(
				(item) => item.id.type === 'Identifier' && item.id.name === name,
			);
		}

		return false;
	});

const findStaticFileLocalName = (ast: File) => {
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.importKind === 'type' ||
			statement.source.value !== 'remotion'
		) {
			continue;
		}

		for (const specifier of statement.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
				specifier.importKind !== 'type' &&
				getImportedName(specifier) === 'staticFile'
			) {
				return specifier.local?.name ?? 'staticFile';
			}
		}
	}

	return null;
};

const getStaticFileLocalName = (ast: File) => {
	const existing = findStaticFileLocalName(ast);
	if (existing !== null) {
		return existing;
	}

	if (hasTopLevelBinding(ast, 'staticFile')) {
		throw new Error(
			'Cannot install Element source because staticFile is already defined',
		);
	}

	return ensureNamedImport({
		ast,
		importedName: 'staticFile',
		localName: 'staticFile',
		sourcePath: 'remotion',
	});
};

export const lowerElementStaticFileRefs = ({
	assets,
	sourceCode,
}: {
	assets: readonly {readonly path: string}[];
	sourceCode: string;
}): {sourceCode: string; referencedAssetPaths: string[]} => {
	if (!sourceCode.includes('staticFileRef')) {
		return {sourceCode, referencedAssetPaths: []};
	}

	const ast = parseAst(sourceCode);
	const importedLocalNames = new Set<string>();
	const namespaceLocalNames = new Set<string>();
	const protocolImports: ImportDeclaration[] = [];
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.source.value !== protocolPackage
		) {
			continue;
		}

		protocolImports.push(statement);
		if (statement.importKind === 'type') {
			continue;
		}

		for (const specifier of statement.specifiers ?? []) {
			if (specifier.type === 'ImportNamespaceSpecifier') {
				namespaceLocalNames.add(specifier.local.name);
			} else if (
				specifier.type === 'ImportSpecifier' &&
				isValueImport(statement, specifier)
			) {
				importedLocalNames.add(specifier.local?.name ?? 'staticFileRef');
			}
		}
	}

	const calls: Array<{
		call: namedTypes.CallExpression;
		assetPath: string;
	}> = [];
	const declaredPaths = new Set(assets.map((asset) => asset.path));
	const existingStaticFileLocalName = findStaticFileLocalName(ast);
	recast.types.visit(ast, {
		visitCallExpression(path) {
			const {callee} = path.node;
			if (
				callee.type === 'Identifier' &&
				callee.name === 'staticFileRef' &&
				!importedLocalNames.has(callee.name) &&
				path.scope.lookup(callee.name) === null
			) {
				throw new Error(
					'Import staticFileRef() as a named import from @remotion/studio-protocol',
				);
			}

			if (
				callee.type === 'MemberExpression' &&
				callee.object.type === 'Identifier' &&
				namespaceLocalNames.has(callee.object.name) &&
				path.scope.lookup(callee.object.name)?.path.node.type === 'Program' &&
				((!callee.computed &&
					callee.property.type === 'Identifier' &&
					callee.property.name === 'staticFileRef') ||
					(callee.computed &&
						callee.property.type === 'StringLiteral' &&
						callee.property.value === 'staticFileRef'))
			) {
				throw new Error(
					'Import staticFileRef() as a named import from @remotion/studio-protocol',
				);
			}

			if (
				callee.type !== 'Identifier' ||
				!importedLocalNames.has(callee.name) ||
				path.scope.lookup(callee.name)?.path.node.type !== 'Program'
			) {
				this.traverse(path);
				return undefined;
			}

			if (
				path.node.arguments.length !== 2 ||
				path.node.arguments[0]?.type !== 'StringLiteral' ||
				path.node.arguments[1]?.type !== 'StringLiteral'
			) {
				throw new Error(
					'staticFileRef() requires an asset path and preview source as string literals',
				);
			}

			const outputLocalName = existingStaticFileLocalName ?? 'staticFile';
			const staticFileBinding = path.scope.lookup(outputLocalName);
			if (
				(existingStaticFileLocalName === null && staticFileBinding !== null) ||
				(existingStaticFileLocalName !== null &&
					staticFileBinding?.path.node.type !== 'Program')
			) {
				throw new Error(
					`Cannot install Element source because ${outputLocalName} is shadowed where staticFileRef() is used`,
				);
			}

			const assetPath = path.node.arguments[0].value;
			if (!declaredPaths.has(assetPath)) {
				throw new Error(
					`staticFileRef() path ${JSON.stringify(assetPath)} is not declared in the Element assets`,
				);
			}

			calls.push({assetPath, call: path.node});
			return false;
		},
	});

	let remainingReference: string | null = null;
	recast.types.visit(ast, {
		visitIdentifier(path) {
			if (
				remainingReference === null &&
				importedLocalNames.has(path.node.name) &&
				path.parentPath.node.type !== 'ImportSpecifier' &&
				path.scope.lookup(path.node.name)?.path.node.type === 'Program' &&
				!calls.some((item) => item.call.callee === path.node)
			) {
				remainingReference = path.node.name;
				return false;
			}

			this.traverse(path);
			return undefined;
		},
	});
	if (remainingReference !== null) {
		throw new Error(
			'staticFileRef() may only be used as a direct function call',
		);
	}

	if (calls.length === 0 && importedLocalNames.size === 0) {
		return {sourceCode, referencedAssetPaths: []};
	}

	const staticFileLocalName =
		calls.length === 0 ? null : getStaticFileLocalName(ast);
	for (const {assetPath, call} of calls) {
		call.callee = recast.types.builders.identifier(
			staticFileLocalName as string,
		);
		call.arguments = [recast.types.builders.stringLiteral(assetPath)];
	}

	for (const declaration of protocolImports) {
		declaration.specifiers = (declaration.specifiers ?? []).filter(
			(specifier) =>
				specifier.type !== 'ImportSpecifier' ||
				!isValueImport(declaration, specifier),
		);
		if (declaration.specifiers.length === 0) {
			ast.program.body = ast.program.body.filter(
				(statement) => statement !== declaration,
			);
		}
	}

	return {
		referencedAssetPaths: [...new Set(calls.map((item) => item.assetPath))],
		sourceCode: serializeAst(ast),
	};
};

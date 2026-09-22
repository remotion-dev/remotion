import type {
	ImportDeclaration,
	ImportSpecifier,
	isReferenced as BabelIsReferenced,
	Node,
} from '@babel/types';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {ensureNamedImport, getImportedName} from './sequence-props/imports';
import {parseAst, serializeAst} from './sequence-props/parse-ast';

// Load the standalone CommonJS validator without the root's Node-only environment checks.
const isReferenced: typeof BabelIsReferenced =
	require('@babel/types/lib/validators/isReferenced').default;

const isStaticFileRefImport = (specifier: ImportSpecifier) =>
	specifier.importKind !== 'type' &&
	getImportedName(specifier) === 'staticFileRef';

export const lowerElementStaticFileRefs = ({
	assets,
	sourceCode,
}: {
	assets: readonly {readonly path: string}[];
	sourceCode: string;
}): string => {
	if (!sourceCode.includes('staticFileRef')) {
		return sourceCode;
	}

	const ast = parseAst(sourceCode);
	const importedLocalNames = new Set<string>();
	const namespaceLocalNames = new Set<string>();
	const protocolImports: ImportDeclaration[] = [];
	let existingStaticFileLocalName: string | null = null;
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.importKind === 'type'
		) {
			continue;
		}

		for (const specifier of statement.specifiers ?? []) {
			if (
				statement.source.value === 'remotion' &&
				specifier.type === 'ImportSpecifier' &&
				specifier.importKind !== 'type' &&
				getImportedName(specifier) === 'staticFile'
			) {
				existingStaticFileLocalName ??= specifier.local?.name ?? 'staticFile';
			}

			if (statement.source.value !== '@remotion/studio-protocol') {
				continue;
			}

			if (specifier.type === 'ImportNamespaceSpecifier') {
				namespaceLocalNames.add(specifier.local.name);
			} else if (
				specifier.type === 'ImportSpecifier' &&
				isStaticFileRefImport(specifier)
			) {
				importedLocalNames.add(specifier.local?.name ?? 'staticFileRef');
				if (!protocolImports.includes(statement)) {
					protocolImports.push(statement);
				}
			}
		}
	}

	const calls: namedTypes.CallExpression[] = [];
	const declaredPaths = new Set(assets.map((asset) => asset.path));
	const outputLocalName = existingStaticFileLocalName ?? 'staticFile';
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

			calls.push(path.node);
			// This direct call is valid; only inspect references elsewhere.
			return false;
		},
		visitIdentifier(path) {
			if (
				importedLocalNames.has(path.node.name) &&
				path.scope.lookup(path.node.name)?.path.node.type === 'Program' &&
				isReferenced(
					path.node as Node,
					path.parentPath.node as Node,
					path.parentPath.parentPath?.node as Node | undefined,
				)
			) {
				throw new Error(
					'staticFileRef() may only be used as a direct function call',
				);
			}

			this.traverse(path);
			return undefined;
		},
	});

	if (calls.length === 0 && importedLocalNames.size === 0) {
		return sourceCode;
	}

	if (calls.length > 0) {
		const localName = ensureNamedImport({
			ast,
			importedName: 'staticFile',
			localName: outputLocalName,
			sourcePath: 'remotion',
		});
		for (const call of calls) {
			call.callee = recast.types.builders.identifier(localName);
			call.arguments = [call.arguments[0]];
		}
	}

	for (const declaration of protocolImports) {
		declaration.specifiers = (declaration.specifiers ?? []).filter(
			(specifier) =>
				specifier.type !== 'ImportSpecifier' ||
				!isStaticFileRefImport(specifier),
		);
		if (declaration.specifiers.length === 0) {
			ast.program.body = ast.program.body.filter(
				(statement) => statement !== declaration,
			);
		}
	}

	return serializeAst(ast);
};

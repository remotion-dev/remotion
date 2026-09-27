import type {
	ClassDeclaration,
	File,
	FunctionDeclaration,
	ImportDeclaration,
	ImportSpecifier,
	VariableDeclaration,
} from '@babel/types';
import * as recast from 'recast';

const b = recast.types.builders;

export const declarationBindsName = (
	declaration: FunctionDeclaration | ClassDeclaration | VariableDeclaration,
	name: string,
) => {
	if (
		declaration.type === 'FunctionDeclaration' ||
		declaration.type === 'ClassDeclaration'
	) {
		return declaration.id?.name === name;
	}

	return declaration.declarations.some((variableDeclaration) => {
		return (
			variableDeclaration.id.type === 'Identifier' &&
			variableDeclaration.id.name === name
		);
	});
};

export const hasTopLevelBinding = ({ast, name}: {ast: File; name: string}) => {
	return ast.program.body.some((node) => {
		if (
			node.type === 'FunctionDeclaration' ||
			node.type === 'ClassDeclaration' ||
			node.type === 'VariableDeclaration'
		) {
			return declarationBindsName(node, name);
		}

		if (
			node.type === 'ExportNamedDeclaration' &&
			node.declaration &&
			(node.declaration.type === 'FunctionDeclaration' ||
				node.declaration.type === 'ClassDeclaration' ||
				node.declaration.type === 'VariableDeclaration')
		) {
			return declarationBindsName(node.declaration, name);
		}

		if (node.type !== 'ImportDeclaration') {
			return false;
		}

		return node.specifiers?.some((specifier) => specifier.local?.name === name);
	});
};

export const getImportedName = (specifier: ImportSpecifier) => {
	if (specifier.imported.type === 'Identifier') {
		return specifier.imported.name;
	}

	return specifier.imported.value;
};

export const findImportDeclaration = (
	ast: File,
	sourcePath: string,
): ImportDeclaration | null => {
	for (const stmt of ast.program.body) {
		if (
			stmt.type === 'ImportDeclaration' &&
			stmt.source.type === 'StringLiteral' &&
			stmt.source.value === sourcePath
		) {
			return stmt;
		}
	}

	return null;
};

const findImportDeclarations = (
	ast: File,
	sourcePath: string,
): ImportDeclaration[] => {
	return ast.program.body.filter(
		(stmt): stmt is ImportDeclaration =>
			stmt.type === 'ImportDeclaration' &&
			stmt.source.type === 'StringLiteral' &&
			stmt.source.value === sourcePath,
	);
};

export const insertImportDeclaration = (
	ast: File,
	importDeclaration: ImportDeclaration,
) => {
	const {body} = ast.program;
	let lastImportIndex = -1;
	for (let i = 0; i < body.length; i++) {
		if (body[i].type === 'ImportDeclaration') {
			lastImportIndex = i;
		}
	}

	body.splice(lastImportIndex + 1, 0, importDeclaration);
};

export const normalizeImportSpacing = (input: string) => {
	return input.replace(/(import[^\n]*\n)\n+(?=import\b)/g, '$1');
};

const hasNamespaceSpecifier = (importDeclaration: ImportDeclaration) => {
	return importDeclaration.specifiers?.some(
		(specifier) => specifier.type === 'ImportNamespaceSpecifier',
	);
};

export const ensureNamedImport = ({
	ast,
	importedName,
	sourcePath,
	localName,
}: {
	ast: File;
	importedName: string;
	sourcePath: string;
	localName: string;
}) => {
	const existingImports = findImportDeclarations(ast, sourcePath);

	for (const existingImportDeclaration of existingImports) {
		if (existingImportDeclaration.importKind === 'type') {
			continue;
		}

		const matchingSpecifier = existingImportDeclaration.specifiers?.find(
			(importSpecifierCandidate) =>
				importSpecifierCandidate.type === 'ImportSpecifier' &&
				importSpecifierCandidate.importKind !== 'type' &&
				getImportedName(importSpecifierCandidate) === importedName,
		);

		if (matchingSpecifier) {
			return matchingSpecifier.local?.name ?? importedName;
		}
	}

	const existingImport = existingImports.find(
		(candidateImportDeclaration) =>
			candidateImportDeclaration.importKind !== 'type' &&
			!hasNamespaceSpecifier(candidateImportDeclaration),
	);

	if (existingImport) {
		const importSpecifier = b.importSpecifier(
			b.identifier(importedName),
			b.identifier(localName),
		) as unknown as ImportSpecifier;

		existingImport.specifiers = [
			...(existingImport.specifiers ?? []),
			importSpecifier,
		];
		return localName;
	}

	const specifier = b.importSpecifier(
		b.identifier(importedName),
		b.identifier(localName),
	) as unknown as ImportSpecifier;
	const importDeclaration = b.importDeclaration(
		[specifier as never],
		b.stringLiteral(sourcePath),
	) as unknown as ImportDeclaration;
	insertImportDeclaration(ast, importDeclaration);
	return localName;
};

export const ensureNamedImports = ({
	ast,
	importedNames,
	sourcePath,
}: {
	ast: File;
	importedNames: ReadonlySet<string>;
	sourcePath: string;
}) => {
	if (importedNames.size === 0) {
		return;
	}

	const existingImports = findImportDeclarations(ast, sourcePath);
	const existingNames = new Set<string>();

	for (const existingImportDeclaration of existingImports) {
		if (existingImportDeclaration.importKind === 'type') {
			continue;
		}

		for (const importSpecifierCandidate of existingImportDeclaration.specifiers ??
			[]) {
			if (
				importSpecifierCandidate.type !== 'ImportSpecifier' ||
				importSpecifierCandidate.importKind === 'type'
			) {
				continue;
			}

			const importedName = getImportedName(importSpecifierCandidate);
			const localName = importSpecifierCandidate.local?.name ?? importedName;
			if (localName === importedName) {
				existingNames.add(importedName);
			}
		}
	}

	const existingImport = existingImports.find(
		(candidateImportDeclaration) =>
			candidateImportDeclaration.importKind !== 'type' &&
			!hasNamespaceSpecifier(candidateImportDeclaration),
	);

	if (existingImport) {
		for (const importedName of importedNames) {
			if (existingNames.has(importedName)) {
				continue;
			}

			existingImport.specifiers = [
				...(existingImport.specifiers ?? []),
				b.importSpecifier(
					b.identifier(importedName),
				) as unknown as ImportSpecifier,
			];
			existingNames.add(importedName);
		}

		return;
	}

	const specifiers = [...importedNames]
		.filter((importedName) => !existingNames.has(importedName))
		.map(
			(importedName) =>
				b.importSpecifier(
					b.identifier(importedName),
				) as unknown as ImportSpecifier,
		);

	if (specifiers.length === 0) {
		return;
	}

	const importDeclaration = b.importDeclaration(
		specifiers as never,
		b.stringLiteral(sourcePath),
	) as unknown as ImportDeclaration;
	insertImportDeclaration(ast, importDeclaration);
};

export const getImportDeclarations = ({
	ast,
	sourcePath,
}: {
	ast: File;
	sourcePath: string;
}) => {
	return ast.program.body.filter(
		(node): node is ImportDeclaration =>
			node.type === 'ImportDeclaration' &&
			node.source.type === 'StringLiteral' &&
			node.source.value === sourcePath,
	);
};

const findImportedLocalName = ({
	ast,
	importedName,
	sourcePath,
}: {
	ast: File;
	importedName: string;
	sourcePath: string;
}) => {
	for (const declaration of getImportDeclarations({ast, sourcePath})) {
		if (declaration.importKind === 'type') {
			continue;
		}

		const existing = declaration.specifiers.find(
			(specifier) =>
				specifier.type === 'ImportSpecifier' &&
				specifier.importKind !== 'type' &&
				getImportedName(specifier) === importedName,
		);
		if (existing) {
			return existing.local?.name ?? importedName;
		}
	}

	return null;
};

// Reuses an existing import of the export, otherwise imports it under the
// preferred local name, adding a numeric suffix when that name is taken.
export const ensureOfficialNamedImport = ({
	ast,
	importedName,
	sourcePath,
	preferredLocalName,
}: {
	ast: File;
	importedName: string;
	sourcePath: string;
	preferredLocalName: string;
}) => {
	const existing = findImportedLocalName({ast, importedName, sourcePath});
	if (existing !== null) {
		return existing;
	}

	let localName = preferredLocalName;
	let suffix = 2;
	while (hasTopLevelBinding({ast, name: localName})) {
		localName = `${preferredLocalName}${suffix++}`;
	}

	return ensureNamedImport({ast, importedName, sourcePath, localName});
};

// Serialized values are written as literal `staticFile(...)` calls, so the
// binding must be named exactly `staticFile`.
export const ensureStaticFileBinding = (ast: File) => {
	if (
		findImportedLocalName({
			ast,
			importedName: 'staticFile',
			sourcePath: 'remotion',
		}) === 'staticFile'
	) {
		return;
	}

	if (hasTopLevelBinding({ast, name: 'staticFile'})) {
		throw new Error(
			'Cannot write staticFile() because "staticFile" is already bound to something else in this file',
		);
	}

	ensureNamedImports({
		ast,
		importedNames: new Set(['staticFile']),
		sourcePath: 'remotion',
	});
};

import type {File, ImportDeclaration, ImportSpecifier} from '@babel/types';
import * as recast from 'recast';

const b = recast.types.builders;

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
		const matchingSpecifier = existingImportDeclaration.specifiers?.find(
			(importSpecifierCandidate) =>
				importSpecifierCandidate.type === 'ImportSpecifier' &&
				getImportedName(importSpecifierCandidate) === importedName,
		);

		if (matchingSpecifier) {
			return matchingSpecifier.local?.name ?? importedName;
		}
	}

	const existingImport = existingImports.find(
		(candidateImportDeclaration) =>
			!hasNamespaceSpecifier(candidateImportDeclaration),
	);

	if (existingImport) {
		const importSpecifier = b.importSpecifier(
			b.identifier(importedName),
			localName === importedName ? null : b.identifier(localName),
		) as unknown as ImportSpecifier;

		existingImport.specifiers = [
			...(existingImport.specifiers ?? []),
			importSpecifier,
		];
		return localName;
	}

	const specifier = b.importSpecifier(
		b.identifier(importedName),
		localName === importedName ? null : b.identifier(localName),
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
		for (const importSpecifierCandidate of existingImportDeclaration.specifiers ??
			[]) {
			if (importSpecifierCandidate.type !== 'ImportSpecifier') {
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

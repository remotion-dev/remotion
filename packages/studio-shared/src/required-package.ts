import type {InsertableCompositionElement} from './api-requests';

export const isValidPackageName = (packageName: string): boolean => {
	if (
		packageName.length === 0 ||
		packageName.length > 214 ||
		packageName === '.' ||
		packageName === '..'
	) {
		return false;
	}

	return /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/i.test(
		packageName,
	);
};

const extractImportPaths = (sourceCode: string): string[] => {
	const importPaths = new Set<string>();
	const staticImportRegex =
		/\b(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]/g;
	const dynamicImportRegex = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

	for (const match of sourceCode.matchAll(staticImportRegex)) {
		if (match[1]) {
			importPaths.add(match[1]);
		}
	}

	for (const match of sourceCode.matchAll(dynamicImportRegex)) {
		if (match[1]) {
			importPaths.add(match[1]);
		}
	}

	return [...importPaths];
};

export const getRequiredPackageForImportPath = (
	importPath: string,
): string | null => {
	if (importPath === 'remotion' || importPath.startsWith('.')) {
		return null;
	}

	if (importPath.startsWith('@')) {
		const [scope, scopedPackageName] = importPath.split('/');
		const scopedPackage =
			scope && scopedPackageName ? `${scope}/${scopedPackageName}` : null;
		return scopedPackage && isValidPackageName(scopedPackage)
			? scopedPackage
			: null;
	}

	const [packageName] = importPath.split('/');
	return packageName && isValidPackageName(packageName) ? packageName : null;
};

export const getRequiredPackageForInsertableElement = (
	element: InsertableCompositionElement,
): string | null => {
	if (element.type === 'solid') {
		return null;
	}

	if (element.type === 'component') {
		return getRequiredPackageForImportPath(element.importPath);
	}

	if (element.type === 'composition') {
		return null;
	}

	if (element.assetType === 'video' || element.assetType === 'audio') {
		return '@remotion/media';
	}

	if (element.assetType === 'gif') {
		return '@remotion/gif';
	}

	if (element.assetType === 'animated-image') {
		return null;
	}

	return null;
};

export const getRequiredPackageForEffectImportPath = (
	importPath: string,
): string | null => {
	if (importPath.startsWith('@remotion/effects/')) {
		return '@remotion/effects';
	}

	if (
		importPath === '@remotion/light-leaks' ||
		importPath === '@remotion/starburst'
	) {
		return importPath;
	}

	return null;
};

export const getRequiredPackagesForElementSourceCode = (
	sourceCode: string,
): string[] => {
	const requiredPackages = new Set<string>();

	for (const importPath of extractImportPaths(sourceCode)) {
		const requiredPackage = getRequiredPackageForImportPath(importPath);
		if (requiredPackage) {
			requiredPackages.add(requiredPackage);
		}
	}

	return [...requiredPackages];
};

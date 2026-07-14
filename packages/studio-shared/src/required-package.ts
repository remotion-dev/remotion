import type {InsertableCompositionElement} from './api-requests';
import {extraPackages, packages} from './package-info';

const firstPartyPackageNames = new Set(
	packages.map((pkg) => `@remotion/${pkg}`),
);
const extraPackageNames = new Set(extraPackages.map((pkg) => pkg.name));

const isInstallableElementPackage = (packageName: string): boolean => {
	return (
		firstPartyPackageNames.has(packageName) ||
		extraPackageNames.has(packageName)
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
		return scope && scopedPackageName ? `${scope}/${scopedPackageName}` : null;
	}

	const [packageName] = importPath.split('/');
	return packageName || null;
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
		if (requiredPackage && isInstallableElementPackage(requiredPackage)) {
			requiredPackages.add(requiredPackage);
		}
	}

	return [...requiredPackages];
};

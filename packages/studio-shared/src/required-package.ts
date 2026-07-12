import type {InsertableCompositionElement} from './api-requests';
import {extraPackages, installableMap, packages} from './package-info';

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

const firstPartyPackages = new Set(
	packages
		.filter((pkg) => installableMap[pkg])
		.map((pkg) => `@remotion/${pkg}`),
);

const extraPackageNames = new Set(extraPackages.map((pkg) => pkg.name));

export const isAllowedElementDependencyPackage = (packageName: string) => {
	return (
		firstPartyPackages.has(packageName) || extraPackageNames.has(packageName)
	);
};

const fromImportPathRegex =
	/^(?:import|export)\s+(?:type\s+)?.+\s+from\s+['"]([^'"]+)['"]/;
const sideEffectImportPathRegex = /^import\s+['"]([^'"]+)['"]/;

export const getRequiredPackagesForElementSourceCode = (sourceCode: string) => {
	const requiredPackages: string[] = [];

	for (const line of sourceCode.split('\n')) {
		const trimmed = line.trim();
		const match =
			trimmed.match(fromImportPathRegex) ??
			trimmed.match(sideEffectImportPathRegex);
		const importPath = match?.[1] ?? null;
		const requiredPackage =
			importPath === null ? null : getRequiredPackageForImportPath(importPath);

		if (
			requiredPackage !== null &&
			isAllowedElementDependencyPackage(requiredPackage) &&
			!requiredPackages.includes(requiredPackage)
		) {
			requiredPackages.push(requiredPackage);
		}
	}

	return requiredPackages;
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

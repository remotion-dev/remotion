import type {InsertableCompositionElement} from './api-requests';

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

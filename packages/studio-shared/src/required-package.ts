import type {InsertableCompositionElement} from './api-requests';

export const getRequiredPackageForInsertableElement = (
	element: InsertableCompositionElement,
): string | null => {
	if (element.type === 'solid') {
		return null;
	}

	if (element.type === 'shape') {
		return '@remotion/shapes';
	}

	if (element.assetType === 'video' || element.assetType === 'audio') {
		return '@remotion/media';
	}

	if (element.assetType === 'gif') {
		return '@remotion/gif';
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

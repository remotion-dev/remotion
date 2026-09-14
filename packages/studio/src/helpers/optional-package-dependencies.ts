import {extraPackages, type PackageInstallSpec} from '@remotion/studio-shared';

export const TRANSFORMERS_PACKAGE = '@huggingface/transformers';

const packagesRequiringTransformers = new Set([
	'@remotion/whisper-webgpu',
	'@remotion/video-matting',
]);

export const withRequiredAuxiliaryPackages = (
	dependencies: readonly PackageInstallSpec[],
): PackageInstallSpec[] => {
	if (
		!dependencies.some((dependency) =>
			packagesRequiringTransformers.has(dependency.name),
		) ||
		dependencies.some((dependency) => dependency.name === TRANSFORMERS_PACKAGE)
	) {
		return [...dependencies];
	}

	const transformers = extraPackages.find(
		(pkg) => pkg.name === TRANSFORMERS_PACKAGE,
	);
	if (!transformers) {
		throw new Error(`No recommended version found for ${TRANSFORMERS_PACKAGE}`);
	}

	return [
		...dependencies,
		{name: transformers.name, version: transformers.version},
	];
};

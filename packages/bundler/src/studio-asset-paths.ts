import {createRequire} from 'node:module';
import path from 'node:path';

export type StudioBundlerAssetPaths = {
	renderEntryPath: string;
	studioPackageAliasPath: string | null;
};

export const resolveStudioBundlerAssetPaths = (
	remotionRoot: string,
): StudioBundlerAssetPaths => {
	const requireFromRoot = createRequire(
		path.join(remotionRoot, 'package.json'),
	);

	try {
		const renderEntry = requireFromRoot.resolve('@remotion/studio/renderEntry');
		const studioPackageAliasPath = requireFromRoot.resolve('@remotion/studio');

		return {
			renderEntryPath: path.join(renderEntry, '..', 'esm', 'renderEntry.mjs'),
			studioPackageAliasPath,
		};
	} catch (cause) {
		throw new Error(
			[
				'Could not resolve the Studio runtime assets that are needed for bundling.',
				'Install `@remotion/studio` in the project or pass explicit Studio asset paths.',
				`Original error: ${String(cause)}`,
			].join(' '),
		);
	}
};

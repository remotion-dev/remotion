import fs from 'node:fs';
import path from 'node:path';

const getPublicPath = (indexHtml: string): unknown => {
	const match = indexHtml.match(
		/window\.remotion_publicPath\s*=\s*("(?:[^"\\]|\\.)*")\s*;/,
	);

	if (!match) {
		return null;
	}

	try {
		return JSON.parse(match[1]);
	} catch (error) {
		throw new Error(
			'Could not parse `window.remotion_publicPath` in the bundle index.html.',
			{cause: error},
		);
	}
};

const validateNoDirectorySymlinks = (
	directory: string,
	bundleDir: string,
): void => {
	for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isSymbolicLink()) {
			if (fs.statSync(entryPath).isDirectory()) {
				throw new Error(
					`The bundle directory ${bundleDir} contains a symbolic link to a directory at ${path.relative(bundleDir, entryPath)}. Directory symbolic links are not supported by \`deploySiteFromBundle()\`.`,
				);
			}

			continue;
		}

		if (entry.isDirectory()) {
			validateNoDirectorySymlinks(entryPath, bundleDir);
		}
	}
};

export const validateBundleDir = (bundleDir: unknown): string => {
	if (typeof bundleDir !== 'string') {
		throw new TypeError(
			`The \`bundleDir\` must be a string, but received ${JSON.stringify(bundleDir)}.`,
		);
	}

	const resolvedBundleDir = path.resolve(bundleDir);

	if (!fs.existsSync(resolvedBundleDir)) {
		throw new Error(
			`The bundle directory ${resolvedBundleDir} does not exist. Run \`npx remotion bundle\` or pass a valid \`bundleDir\`.`,
		);
	}

	if (!fs.statSync(resolvedBundleDir).isDirectory()) {
		throw new Error(
			`The bundle path ${resolvedBundleDir} is not a directory. Pass the directory returned by \`bundle()\` or created by \`npx remotion bundle\`.`,
		);
	}

	const indexHtmlPath = path.join(resolvedBundleDir, 'index.html');
	if (!fs.existsSync(indexHtmlPath) || !fs.statSync(indexHtmlPath).isFile()) {
		throw new Error(
			`The bundle directory ${resolvedBundleDir} does not contain an index.html file at its root.`,
		);
	}

	const bundleScriptPath = path.join(resolvedBundleDir, 'bundle.js');
	if (
		!fs.existsSync(bundleScriptPath) ||
		!fs.statSync(bundleScriptPath).isFile()
	) {
		throw new Error(
			`The bundle directory ${resolvedBundleDir} does not contain a bundle.js file at its root.`,
		);
	}

	const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
	const publicPath = getPublicPath(indexHtml);
	const hasRelocatableBundleMarker = indexHtml.includes(
		'<meta name="remotion-bundle-public-path" content="relative" />',
	);
	if (publicPath !== './' || !hasRelocatableBundleMarker) {
		throw new Error(
			`The bundle at ${resolvedBundleDir} is not relocatable. Rebuild it using Remotion v4.0.497 or newer.`,
		);
	}

	validateNoDirectorySymlinks(resolvedBundleDir, resolvedBundleDir);

	return resolvedBundleDir;
};

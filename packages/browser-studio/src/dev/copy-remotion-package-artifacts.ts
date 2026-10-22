import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from 'node:fs';
import {dirname, isAbsolute, join, relative, sep} from 'node:path';
import {browserStudioPackageJsonArtifactFilename} from '../workspace-package-exports';
import {getBrowserStudioWorkspacePackageExportsForBuild} from './get-workspace-package-exports-for-build';

export type BrowserStudioRemotionPackageArtifactManifest = {
	readonly files: Record<string, string>;
	readonly packages: ReturnType<
		typeof getBrowserStudioWorkspacePackageExportsForBuild
	>;
	readonly source:
		| {readonly type: 'workspace'; readonly commit: string}
		| {readonly type: 'release'; readonly version: string};
};

export const copyBrowserStudioRemotionPackageArtifacts = ({
	outputDir,
	repoDir,
	source,
}: {
	readonly outputDir: string;
	readonly repoDir: string;
	readonly source: BrowserStudioRemotionPackageArtifactManifest['source'];
}) => {
	if (!isAbsolute(outputDir) || !isAbsolute(repoDir)) {
		throw new Error('Remotion package artifact paths must be absolute');
	}

	if (existsSync(outputDir)) {
		throw new Error(
			`Refusing to overwrite existing Remotion package artifacts at ${outputDir}`,
		);
	}

	const packages = getBrowserStudioWorkspacePackageExportsForBuild();
	for (const {exports, packageRoot} of Object.values(packages)) {
		const pathsToCopy = new Set<string>();
		for (const target of Object.values(exports)) {
			if (!target.startsWith('./')) {
				continue;
			}

			const relativeTarget = target.slice(2);
			if (relativeTarget.startsWith('dist/esm/')) {
				pathsToCopy.add('dist/esm');
			} else if (relativeTarget.startsWith('dist/')) {
				pathsToCopy.add('dist');
			} else if (relativeTarget.includes('*')) {
				pathsToCopy.add(
					dirname(relativeTarget.slice(0, relativeTarget.indexOf('*'))),
				);
			} else {
				pathsToCopy.add(relativeTarget);
			}
		}

		for (const relativePath of pathsToCopy) {
			if (
				relativePath === '.' ||
				relativePath.startsWith('..') ||
				isAbsolute(relativePath)
			) {
				throw new Error(
					`Invalid Remotion package artifact path: ${relativePath}`,
				);
			}

			const sourcePath = join(
				repoDir,
				packageRoot,
				relativePath === browserStudioPackageJsonArtifactFilename
					? 'package.json'
					: relativePath,
			);
			if (!existsSync(sourcePath)) {
				throw new Error(
					`Missing built Remotion package artifact: ${sourcePath}`,
				);
			}

			const destinationPath = join(outputDir, packageRoot, relativePath);
			mkdirSync(dirname(destinationPath), {recursive: true});
			cpSync(sourcePath, destinationPath, {recursive: true});
		}
	}

	const files: Record<string, string> = {};
	const visit = (directory: string) => {
		for (const entry of readdirSync(directory, {withFileTypes: true})) {
			const absolutePath = join(directory, entry.name);
			if (entry.isDirectory()) {
				visit(absolutePath);
			} else if (entry.isFile()) {
				const relativePath = relative(outputDir, absolutePath)
					.split(sep)
					.join('/');
				files[relativePath] = new Bun.CryptoHasher('sha256')
					.update(Uint8Array.from(readFileSync(absolutePath)))
					.digest('hex');
			}
		}
	};

	visit(outputDir);

	const manifest: BrowserStudioRemotionPackageArtifactManifest = {
		files: Object.fromEntries(
			Object.entries(files).sort(([left], [right]) =>
				left.localeCompare(right),
			),
		),
		packages,
		source,
	};
	writeFileSync(
		join(outputDir, 'manifest.json'),
		`${JSON.stringify(manifest, null, 2)}\n`,
	);

	return manifest;
};

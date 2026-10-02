import {
	copyFileSync,
	existsSync,
	lstatSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	unlinkSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {$} from 'bun';
import limit from 'p-limit';
import {FEATURED_TEMPLATES} from './packages/create-video/src/templates';
import {shouldReleasePackage} from './packages/studio-shared/src/release-package-policy';

const p = limit(4);
const args = process.argv.slice(2);
const listOnly = args.includes('--list');
const checkOnly = args.includes('--check');
const tagArg = args.find((arg) => arg.startsWith('--tag='));
const releaseTag = tagArg?.slice('--tag='.length) ?? null;
const onlyArg = args.find((arg) => arg.startsWith('--only='));
const onlyPackage = onlyArg?.slice('--only='.length) ?? null;

if (
	args.some(
		(arg) =>
			arg !== '--list' &&
			arg !== '--check' &&
			arg !== tagArg &&
			arg !== onlyArg,
	) ||
	(listOnly && (checkOnly || releaseTag !== null || onlyPackage !== null)) ||
	(checkOnly && releaseTag !== null) ||
	(onlyPackage !== null && releaseTag === null && !checkOnly) ||
	releaseTag === '' ||
	onlyPackage === ''
) {
	throw new Error(
		'Usage: bun publish.ts [--list | --check [--only=<package>] | --tag=<dist-tag> [--only=<package>]]',
	);
}

const releaseVersion = JSON.parse(
	readFileSync(
		path.join(process.cwd(), 'packages', 'core', 'package.json'),
		'utf-8',
	),
).version as string;

const dirs = readdirSync('packages')
	.filter((dir) =>
		lstatSync(path.join(process.cwd(), 'packages', dir)).isDirectory(),
	)
	.filter((dir) =>
		existsSync(path.join(process.cwd(), 'packages', dir, 'package.json')),
	);

const packagesToPublish: {
	dir: string;
	name: string;
	hasLicense: boolean;
	hasTsgoBuild: boolean;
	hasPrepublishOnly: boolean;
	packagePath: string;
}[] = [];
let foundOnlyPackage = false;

for (const dir of dirs) {
	const localTemplates = FEATURED_TEMPLATES.map(
		(t) => t.templateInMonorepo,
	).filter(Boolean) as string[];
	if (localTemplates.includes(dir)) {
		continue;
	}

	const packagePath = path.join(process.cwd(), 'packages', dir);
	const packageJsonPath = path.join(packagePath, 'package.json');
	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
	if (packageJson.private) {
		continue;
	}

	if (
		!shouldReleasePackage({
			packageName: packageJson.name,
			releaseVersion,
		})
	) {
		continue;
	}
	if (onlyPackage !== null && packageJson.name !== onlyPackage) {
		continue;
	}
	foundOnlyPackage = true;
	if (listOnly) {
		console.log(packageJson.name);
		continue;
	}

	packagesToPublish.push({
		dir,
		name: packageJson.name,
		hasLicense: packageJson.license?.includes('LICENSE.md') === true,
		hasTsgoBuild: /\btsgo\b/.test(packageJson.scripts?.make ?? ''),
		hasPrepublishOnly: typeof packageJson.scripts?.prepublishOnly === 'string',
		packagePath,
	});
}

if (onlyPackage !== null && !foundOnlyPackage) {
	throw new Error(`No releasable package named ${onlyPackage}`);
}

if (!listOnly) {
	const packedDir = mkdtempSync(path.join(tmpdir(), 'remotion-publish-'));
	const validatedTarballs = new Map<string, string>();

	try {
		// Validate the exact archives that will be published. A successful tsgo build
		// once left dist/render-queue/queue.js empty in @remotion/cli@4.0.531.
		const preflightResults = await Promise.allSettled(
			packagesToPublish
				.filter(({hasTsgoBuild}) => hasTsgoBuild)
				.map(({dir, name, hasLicense, hasPrepublishOnly, packagePath}) =>
					p(async () => {
						const licensePath = path.join(packagePath, 'LICENSE.md');
						const copiedLicense = hasLicense && !existsSync(licensePath);
						const stagingDir = path.join(packedDir, dir);
						mkdirSync(stagingDir);

						if (copiedLicense) {
							copyFileSync(path.join(process.cwd(), 'LICENSE.md'), licensePath);
						}

						try {
							// Publishing a tarball skips prepublishOnly, so run it before packing.
							if (hasPrepublishOnly) {
								await $`bun run prepublishOnly`.cwd(packagePath);
							}

							await $`bun pm pack --destination ${stagingDir} --quiet`.cwd(
								packagePath,
							);
							const tarballName = readdirSync(stagingDir).find((file) =>
								file.endsWith('.tgz'),
							);
							if (!tarballName) {
								throw new Error(`No tarball created for ${name}`);
							}

							const tarball = path.join(stagingDir, tarballName);
							await $`tar -xzf ${tarball} -C ${stagingDir}`.quiet();
							const distDir = path.join(stagingDir, 'package', 'dist');
							const jsFiles = existsSync(distDir)
								? readdirSync(distDir, {recursive: true}).filter((file) =>
										/\.(c|m)?js$/.test(file),
									)
								: [];
							if (jsFiles.length === 0) {
								throw new Error(`No compiled JavaScript in ${name}`);
							}

							const emptyFiles = jsFiles.filter(
								(file) => statSync(path.join(distDir, file)).size === 0,
							);
							if (emptyFiles.length > 0) {
								throw new Error(
									`Empty compiled JavaScript in ${name}: ${emptyFiles.join(', ')}`,
								);
							}

							validatedTarballs.set(name, tarball);
						} finally {
							if (copiedLicense) {
								unlinkSync(licensePath);
							}
						}
					}),
				),
		);
		const preflightFailure = preflightResults.find(
			(result) => result.status === 'rejected',
		);
		if (preflightFailure?.status === 'rejected') {
			throw preflightFailure.reason;
		}

		if (checkOnly) {
			console.log(`Validated ${validatedTarballs.size} compiled packages`);
		} else {
			const publishResults = await Promise.allSettled(
				packagesToPublish.map(({name, hasLicense, packagePath}) =>
					p(async () => {
						const tarball = validatedTarballs.get(name);
						const licensePath = path.join(packagePath, 'LICENSE.md');
						const copiedLicense =
							!tarball && hasLicense && !existsSync(licensePath);

						if (copiedLicense) {
							copyFileSync(path.join(process.cwd(), 'LICENSE.md'), licensePath);
						}

						try {
							if (tarball) {
								if (releaseTag === null) {
									await $`bun publish ${tarball} --tolerate-republish`.cwd(
										packagePath,
									);
								} else {
									await $`bun publish ${tarball} --tag=${releaseTag}`.cwd(
										packagePath,
									);
								}
							} else if (releaseTag === null) {
								await $`bun publish --tolerate-republish`.cwd(packagePath);
							} else {
								await $`bun publish --tag=${releaseTag}`.cwd(packagePath);
							}
						} finally {
							if (copiedLicense) {
								unlinkSync(licensePath);
							}
						}
					}),
				),
			);
			const publishFailure = publishResults.find(
				(result) => result.status === 'rejected',
			);
			if (publishFailure?.status === 'rejected') {
				throw publishFailure.reason;
			}
		}
	} finally {
		rmSync(packedDir, {recursive: true, force: true});
	}
}

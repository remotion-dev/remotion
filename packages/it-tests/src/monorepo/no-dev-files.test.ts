import {test} from 'bun:test';
import {copyFileSync, existsSync, unlinkSync} from 'fs';
import path from 'path';
import {getAllPackages} from './get-all-packages';

const packages = getAllPackages().filter((pkg) => pkg.pkg !== 'google-fonts');

const MAX_CONCURRENT_PACK_CHECKS = 8;
const PACK_TIMEOUT_MS = 15000;
const MAX_PACK_ATTEMPTS = 3;
let activePackChecks = 0;
const packCheckQueue: Array<() => void> = [];

const acquirePackCheckSlot = async (): Promise<() => void> => {
	while (activePackChecks >= MAX_CONCURRENT_PACK_CHECKS) {
		await new Promise<void>((resolve) => {
			packCheckQueue.push(resolve);
		});
	}

	activePackChecks++;
	return () => {
		activePackChecks--;
		const next = packCheckQueue.shift();
		if (next) {
			next();
		}
	};
};

const assertNoDevFilesPublished = async (pkgPath: string) => {
	const packageJson = await Bun.file(pkgPath).json();
	if (packageJson.private) {
		return;
	}

	const dir = path.join(pkgPath, '..');
	const release = await acquirePackCheckSlot();

	const hasLicenseReference = packageJson.license?.includes('LICENSE.md');
	const licensePath = path.join(dir, 'LICENSE.md');
	const copiedLicense = hasLicenseReference && !existsSync(licensePath);

	if (copiedLicense) {
		copyFileSync(
			path.join(__dirname, '..', '..', '..', '..', 'LICENSE.md'),
			licensePath,
		);
	}

	try {
		let hasPackedLicense = false;
		let packedFiles = '';
		for (let attempt = 1; attempt <= MAX_PACK_ATTEMPTS; attempt++) {
			const startedAt = Date.now();
			console.log(
				`Packing ${packageJson.name} (attempt ${attempt}/${MAX_PACK_ATTEMPTS})`,
			);
			const proc = Bun.spawn([process.execPath, 'pm', 'pack', '--dry-run'], {
				cwd: dir,
				stdout: 'pipe',
				stderr: 'pipe',
			});
			let timedOut = false;
			const timeout = setTimeout(() => {
				timedOut = true;
				proc.kill();
			}, PACK_TIMEOUT_MS);

			try {
				const [stdout, stderr, exitCode] = await Promise.all([
					new Response(proc.stdout).text(),
					new Response(proc.stderr).text(),
					proc.exited,
				]);
				if (timedOut) {
					throw new Error(`timed out after ${PACK_TIMEOUT_MS}ms`);
				}

				if (exitCode !== 0) {
					throw new Error(`exited with code ${exitCode}: ${stderr.trim()}`);
				}

				packedFiles = stdout;
				console.log(
					`Packed ${packageJson.name} in ${Date.now() - startedAt}ms`,
				);
				break;
			} catch (error) {
				const reason = error instanceof Error ? error.message : String(error);
				console.warn(
					`Packing ${packageJson.name} failed on attempt ${attempt}/${MAX_PACK_ATTEMPTS} after ${Date.now() - startedAt}ms: ${reason}`,
				);
				if (attempt === MAX_PACK_ATTEMPTS) {
					throw new Error(`Could not pack ${packageJson.name}: ${reason}`);
				}
			} finally {
				clearTimeout(timeout);
			}
		}

		for (const file of packedFiles.split('\n')) {
			const line = file.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
			if (!line.startsWith('packed')) {
				continue;
			}
			const filename = line.split(/\s+/).at(-1) as string;
			if (filename === 'LICENSE.md' || filename.endsWith('/LICENSE.md')) {
				hasPackedLicense = true;
			}

			if (
				filename.includes('eslint.config.mjs') ||
				filename.includes('tsconfig') ||
				filename.includes('.turbo') ||
				filename.includes('happydom') ||
				filename.includes('prettier') ||
				filename.startsWith('vite') ||
				filename.startsWith('src/') ||
				filename.startsWith('.env') ||
				filename.includes('/test/') ||
				(filename.endsWith('.ts') && !filename.endsWith('.d.ts'))
			) {
				console.log(filename);
				throw new Error('Disallowed file found in ' + filename);
			}
		}

		if (hasLicenseReference && !hasPackedLicense) {
			throw new Error('LICENSE.md is not packed for ' + packageJson.name);
		}
	} finally {
		if (copiedLicense) {
			unlinkSync(licensePath);
		}

		release();
	}
};

test(
	'should not publish any dev files',
	async () => {
		const results = await Promise.allSettled(
			packages.map((pkg) => assertNoDevFilesPublished(pkg.path)),
		);
		const errors = results.flatMap((result, index) => {
			if (result.status === 'fulfilled') {
				return [];
			}

			return [
				`@remotion/${packages[index].pkg}: ${
					result.reason instanceof Error
						? result.reason.message
						: String(result.reason)
				}`,
			];
		});
		if (errors.length > 0) {
			throw new Error(errors.join('\n'));
		}
	},
	{timeout: 90000},
);

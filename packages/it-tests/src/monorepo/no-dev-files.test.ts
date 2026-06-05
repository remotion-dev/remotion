import {test} from 'bun:test';
import path from 'path';
import {$} from 'bun';
import {getAllPackages} from './get-all-packages';

const packages = getAllPackages().filter((pkg) => pkg.pkg !== 'google-fonts');

const MAX_CONCURRENT_PACK_CHECKS = 8;
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

	try {
		const files = $`bun pm pack --dry-run`.cwd(dir).lines();
		for await (const file of files) {
			if (!file.startsWith('packed')) {
				continue;
			}
			const [, , filename] = file.split(' ');
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
	} finally {
		release();
	}
};

for (const pkg of packages) {
	test.concurrent(
		'should not publish any dev files for @remotion/' + pkg.pkg,
		async () => {
			await assertNoDevFilesPublished(pkg.path);
		},
	);
}

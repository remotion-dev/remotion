import {$} from 'bun';
import {test} from 'bun:test';
import path from 'path';
import {getAllPackages} from './get-all-packages';

const packages = getAllPackages();

for (const pkg of packages) {
	test(
		'should not publish any dev files for @remotion/' + pkg.pkg,
		async () => {
			const packageJson = await Bun.file(pkg.path).json();
			const isPrivate = packageJson.private;
			if (isPrivate) {
				return;
			}

			const dir = path.join(pkg.path, '..');
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
		},
	);
}

import {expect, test} from 'bun:test';
import {patchPackageJson} from '../patch-package-json';
import type {PackageManager} from '../pkg-managers';

const packageManagers: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

for (const packageManager of packageManagers) {
	test(`Using ${packageManager} package manager provides the correct "packageManager" entry in package.json`, () => {
		const latestRemotionVersion = '1.0.0';
		const packageJson = {
			name: 'my-video',
			version: '1.0.0',
			description: 'My Remotion video',
			scripts: {
				start: 'remotion studio',
			},
			dependencies: {
				'@remotion/cli': 'stale-remotion-version',
				react: '^18.0.0',
				remotion: 'stale-remotion-version',
			},
			devDependencies: {
				'@types/react': '^18.0.6',
				'@remotion/eslint-config': '^2.0.0',
			},
		};
		let newPackageJson: typeof packageJson | null = null;
		patchPackageJson(
			{
				projectRoot: '/path/to/project',
				latestRemotionVersion,
				packageManager,
				projectName: 'my-video',
				addTailwind: true,
			},
			{
				getPackageJson: () => JSON.stringify(packageJson),
				setPackageJson: (_: string, content: string) => {
					newPackageJson = JSON.parse(content);
				},
			},
		);
		const expectedStartScript =
			packageManager === 'bun' ? 'remotionb studio' : 'remotion studio';
		expect(newPackageJson as unknown).toEqual({
			...packageJson,
			scripts: {
				start: expectedStartScript,
			},
			dependencies: {
				...packageJson.dependencies,
				'@remotion/cli': latestRemotionVersion,
				'@remotion/tailwind-v4': latestRemotionVersion,
				tailwindcss: '4.0.0',
				remotion: latestRemotionVersion,
			},
			sideEffects: ['*.css'],
			devDependencies: {
				...packageJson.devDependencies,
				'@remotion/eslint-config': latestRemotionVersion,
			},
		});
	});
}

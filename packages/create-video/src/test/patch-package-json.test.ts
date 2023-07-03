import {expect, test} from 'vitest';
import {patchPackageJson} from '../patch-package-json';
import type {PackageManager} from '../pkg-managers';

const packageManagers: PackageManager[] = ['npm', 'pnpm', 'yarn'];

for (const packageManager of packageManagers) {
	test(`Using ${packageManager} package manager provides the correct "packageManager" entry in package.json`, () => {
		const latestRemotionVersion = '1.0.0';
		const packageManagerVersion = '1.22.19';
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
				packageManager: `${packageManager}@${packageManagerVersion}`,
				projectName: 'my-video',
			},
			{
				getPackageJson: () => JSON.stringify(packageJson),
				setPackageJson: (_: string, content: string) => {
					newPackageJson = JSON.parse(content);
				},
			}
		);
		expect(newPackageJson).to.deep.equal({
			...packageJson,
			dependencies: {
				...packageJson.dependencies,
				'@remotion/cli': latestRemotionVersion,
				remotion: latestRemotionVersion,
			},
			devDependencies: {
				...packageJson.devDependencies,
				'@remotion/eslint-config': latestRemotionVersion,
			},
			packageManager: `${packageManager}@${packageManagerVersion}`,
		});
	});
}

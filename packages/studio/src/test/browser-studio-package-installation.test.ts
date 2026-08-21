import {afterEach, expect, test} from 'bun:test';
import type {BrowserStudioPackageInstallationOperations} from '@remotion/studio-shared';
import {installPackages} from '../api/install-package';
import {canInstallPackages} from '../helpers/browser-studio-operations';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
		return;
	}

	Reflect.deleteProperty(globalThis, 'window');
});

test('routes package installation through the explicit Browser Studio capability', async () => {
	const requests: string[][] = [];
	const packageInstallation: BrowserStudioPackageInstallationOperations = {
		installPackages: ({dependencies}) => {
			requests.push(dependencies.map((dependency) => dependency.name));
			return Promise.resolve({success: true});
		},
	};
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_browserStudio: makeBrowserStudioOperations({
				packageInstallation,
			}),
			remotion_isPlayer: false,
			remotion_isReadOnlyStudio: false,
			remotion_isStudio: true,
		},
	});

	expect(canInstallPackages()).toBe(true);
	expect(
		await installPackages([{name: '@remotion/google-fonts', version: null}]),
	).toEqual({});
	expect(requests).toEqual([['@remotion/google-fonts']]);
});

test('surfaces structured Browser Studio package installation failures', async () => {
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_browserStudio: makeBrowserStudioOperations({
				packageInstallation: {
					installPackages: () =>
						Promise.resolve({
							success: false,
							reason: 'Could not resolve example-package',
							stack: 'browser-studio-stack',
						}),
				},
			}),
			remotion_isPlayer: false,
			remotion_isReadOnlyStudio: true,
			remotion_isStudio: true,
		},
	});

	await expect(
		installPackages([{name: 'example-package', version: null}]),
	).rejects.toThrow('Could not resolve example-package');
});

test('reports package installation as unavailable for an older Browser Studio host', async () => {
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_browserStudio: makeBrowserStudioOperations({}),
			remotion_isPlayer: false,
			remotion_isReadOnlyStudio: false,
			remotion_isStudio: true,
		},
	});

	expect(canInstallPackages()).toBe(false);
	await expect(
		installPackages([{name: '@remotion/google-fonts', version: null}]),
	).rejects.toThrow(
		'Package installation is not supported by this Browser Studio',
	);
});

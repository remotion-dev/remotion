import {afterEach, expect, test} from 'bun:test';
import type {GitSource} from '@remotion/studio-shared';
import {
	hasReadOnlyGitSource,
	openGitSource,
} from '../helpers/get-git-menu-item';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
	} else {
		Reflect.deleteProperty(globalThis, 'window');
	}
});

const gitSource: GitSource = {
	name: 'remotion',
	org: 'remotion-dev',
	ref: 'feature/branch',
	relativeFromGitRoot: 'packages/docs',
	type: 'github',
};

const installTestWindow = ({
	git,
	readOnly,
}: {
	git: GitSource | null;
	readOnly: boolean;
}) => {
	const openedUrls: string[] = [];
	const testWindow: Pick<
		Window,
		'open' | 'remotion_cwd' | 'remotion_gitSource' | 'remotion_isReadOnlyStudio'
	> = {
		open: (url) => {
			openedUrls.push(String(url));
			return null;
		},
		remotion_cwd: '/repo/packages/docs',
		remotion_gitSource: git,
		remotion_isReadOnlyStudio: readOnly,
	};

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: testWindow,
	});

	return openedUrls;
};

test('uses GitHub as an open target in a read-only Studio', () => {
	const openedUrls = installTestWindow({git: gitSource, readOnly: true});

	expect(hasReadOnlyGitSource()).toBe(true);
	openGitSource({
		folder: false,
		location: {
			column: 3,
			line: 12,
			source: '/repo/packages/docs/src/Video.tsx',
		},
	});

	expect(openedUrls).toEqual([
		'https://github.com/remotion-dev/remotion/blob/feature/branch/packages/docs/src/Video.tsx#L12',
	]);
});

test('opens the project folder on the configured GitHub ref', () => {
	const openedUrls = installTestWindow({git: gitSource, readOnly: true});

	openGitSource({folder: true, location: null});

	expect(openedUrls).toEqual([
		'https://github.com/remotion-dev/remotion/tree/feature/branch/packages/docs',
	]);
});

test('does not use GitHub as the fallback in an editable Studio', () => {
	installTestWindow({git: gitSource, readOnly: false});
	expect(hasReadOnlyGitSource()).toBe(false);
});

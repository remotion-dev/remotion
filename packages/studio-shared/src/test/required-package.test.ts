import {expect, test} from 'bun:test';
import {
	getRequiredPackageForEffectImportPath,
	getRequiredPackagesForElementSourceCode,
	getRequiredPackageForInsertableElement,
} from '../required-package';

test('gets required package for insertable elements', () => {
	expect(
		getRequiredPackageForInsertableElement({
			type: 'solid',
			width: 1920,
			height: 1080,
			position: null,
		}),
	).toBe(null);
	expect(
		getRequiredPackageForInsertableElement({
			type: 'asset',
			assetType: 'image',
			src: 'image.png',
			srcType: 'static',
			dimensions: null,
			position: null,
		}),
	).toBe(null);
	expect(
		getRequiredPackageForInsertableElement({
			type: 'asset',
			assetType: 'video',
			src: 'video.mp4',
			srcType: 'static',
			dimensions: null,
			position: null,
		}),
	).toBe('@remotion/media');
	expect(
		getRequiredPackageForInsertableElement({
			type: 'asset',
			assetType: 'audio',
			src: 'audio.mp3',
			srcType: 'static',
			dimensions: null,
			position: null,
		}),
	).toBe('@remotion/media');
	expect(
		getRequiredPackageForInsertableElement({
			type: 'asset',
			assetType: 'gif',
			src: 'animation.gif',
			srcType: 'static',
			dimensions: null,
			position: null,
		}),
	).toBe('@remotion/gif');
	expect(
		getRequiredPackageForInsertableElement({
			type: 'asset',
			assetType: 'animated-image',
			src: 'animated.png',
			srcType: 'static',
			dimensions: null,
			position: null,
		}),
	).toBe(null);
	expect(
		getRequiredPackageForInsertableElement({
			type: 'component',
			componentName: 'Circle',
			importName: 'Circle',
			importPath: '@remotion/shapes',
			props: [],
			position: null,
		}),
	).toBe('@remotion/shapes');
	expect(
		getRequiredPackageForInsertableElement({
			type: 'component',
			componentName: 'Sequence',
			importName: 'Sequence',
			importPath: 'remotion',
			props: [],
			position: null,
		}),
	).toBe(null);
});

test('gets required package for effect import paths', () => {
	expect(
		getRequiredPackageForEffectImportPath('@remotion/effects/brightness'),
	).toBe('@remotion/effects');
	expect(getRequiredPackageForEffectImportPath('@remotion/light-leaks')).toBe(
		'@remotion/light-leaks',
	);
	expect(getRequiredPackageForEffectImportPath('@remotion/starburst')).toBe(
		'@remotion/starburst',
	);
	expect(getRequiredPackageForEffectImportPath('remotion')).toBe(null);
});

test('gets required packages for element source code', () => {
	expect(
		getRequiredPackagesForElementSourceCode(
			[
				"import React from 'react';",
				"import {loadFont} from '@remotion/google-fonts/Inter';",
				"import {starburst} from '@remotion/starburst';",
				"import '@remotion/effects/paper';",
				"import {z} from 'zod';",
				"import {AbsoluteFill} from 'remotion';",
				"import ignored from 'left-pad';",
			].join('\n'),
		),
	).toEqual([
		'@remotion/google-fonts',
		'@remotion/starburst',
		'@remotion/effects',
		'zod',
	]);
});

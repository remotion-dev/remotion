import {expect, test} from 'bun:test';
import {
	getRequiredPackageForEffectImportPath,
	getRequiredPackageForInsertableElement,
	getRequiredPackagesForElementSourceCode,
	isValidPackageName,
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

test('validates package names', () => {
	expect(isValidPackageName('lodash')).toBe(true);
	expect(isValidPackageName('@acme/video')).toBe(true);
	expect(isValidPackageName('@remotion/effects')).toBe(true);
	expect(isValidPackageName('--ignore-scripts')).toBe(false);
	expect(isValidPackageName('@acme/video/extra')).toBe(false);
	expect(isValidPackageName('https:')).toBe(false);
	expect(isValidPackageName('node:path')).toBe(false);
});

test('gets required packages for element source code', () => {
	expect(
		getRequiredPackagesForElementSourceCode(`
			import {loadFont} from '@remotion/google-fonts/Inter';
			import {AbsoluteFill} from 'remotion';
			import React from 'react';
			import './style.css';

			export const LowerThird = () => null;
		`),
	).toEqual(['@remotion/google-fonts', 'react']);

	expect(
		getRequiredPackagesForElementSourceCode(`
			import {paper} from '@remotion/effects/paper';
			import {starburst} from '@remotion/starburst';
			import {z} from 'zod';
			import {Input} from 'lodash';
			import {Output} from '@acme/video';
			import {read} from 'mediabunny';
			import '@mediabunny/prores';

			export const Element = () => null;
		`),
	).toEqual([
		'@remotion/effects',
		'@remotion/starburst',
		'zod',
		'lodash',
		'@acme/video',
		'mediabunny',
		'@mediabunny/prores',
	]);

	expect(
		getRequiredPackagesForElementSourceCode(`
			import {loadFont} from '@remotion/google-fonts/Inter';
			import {loadFont as loadFontAgain} from '@remotion/google-fonts/Roboto';
			const module = import('@remotion/media');
			const builtIn = import('node:path');
			const remote = import('https://example.com/module.js');

			export const Element = () => null;
		`),
	).toEqual(['@remotion/google-fonts', '@remotion/media']);
});

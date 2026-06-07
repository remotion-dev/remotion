import {expect, test} from 'bun:test';
import {
	getRequiredPackageForEffectImportPath,
	getRequiredPackageForInsertableElement,
} from '../required-package';

test('gets required package for insertable elements', () => {
	expect(
		getRequiredPackageForInsertableElement({
			type: 'solid',
			width: 1920,
			height: 1080,
		}),
	).toBe(null);
	expect(
		getRequiredPackageForInsertableElement({
			type: 'asset',
			assetType: 'image',
			src: 'image.png',
			dimensions: null,
		}),
	).toBe(null);
	expect(
		getRequiredPackageForInsertableElement({
			type: 'asset',
			assetType: 'video',
			src: 'video.mp4',
			dimensions: null,
		}),
	).toBe('@remotion/media');
	expect(
		getRequiredPackageForInsertableElement({
			type: 'asset',
			assetType: 'audio',
			src: 'audio.mp3',
			dimensions: null,
		}),
	).toBe('@remotion/media');
	expect(
		getRequiredPackageForInsertableElement({
			type: 'asset',
			assetType: 'gif',
			src: 'animation.gif',
			dimensions: null,
		}),
	).toBe('@remotion/gif');
	expect(
		getRequiredPackageForInsertableElement({
			type: 'shape',
			shape: 'Circle',
		}),
	).toBe('@remotion/shapes');
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

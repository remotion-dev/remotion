import {expect, test} from 'bun:test';
import {getCurrentAssetMetadataSource} from '../components/CurrentAsset';

test('does not request media metadata for image assets', () => {
	expect(getCurrentAssetMetadataSource('1.jpg')).toBe(null);
	expect(getCurrentAssetMetadataSource('nested/file.png')).toBe(null);
	expect(getCurrentAssetMetadataSource('animation.gif')).toBe(null);
});

test('requests media metadata for audio and video assets', () => {
	expect(getCurrentAssetMetadataSource('video.mp4')).toBe('/video.mp4');
	expect(getCurrentAssetMetadataSource('nested/audio.mp3')).toBe(
		'/nested/audio.mp3',
	);
});

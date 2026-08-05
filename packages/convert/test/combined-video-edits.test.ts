import {expect, test} from 'bun:test';
import {makeCrop} from '../app/components/make-crop';
import {
	getPlayerDimensions,
	getVideoPreviewStyle,
} from '../app/components/MediaPlayer';
import {
	getCropRectangleBeforeMirror,
	getCropRectangleBeforeRotation,
} from '../app/lib/apply-crop';

test('keeps a crop aligned between a rotated and mirrored preview and export', () => {
	const dimensionsAfterRotation = getPlayerDimensions({
		dimensions: {width: 200, height: 100},
		isAudio: false,
		rotation: 90,
	});

	expect(dimensionsAfterRotation).toEqual({width: 100, height: 200});
	if (dimensionsAfterRotation === null) {
		throw new Error('Expected video dimensions');
	}

	const cropRect = {left: 10, top: 20, width: 30, height: 50};
	const previewStyle = getVideoPreviewStyle({
		...dimensionsAfterRotation,
		mirrorHorizontal: true,
		mirrorVertical: true,
		rotation: 90,
	});
	const exportCrop = makeCrop({
		cropRect,
		dimensions: dimensionsAfterRotation,
		mirrorHorizontal: true,
		mirrorVertical: true,
		videoCodec: 'vp9',
	});

	expect(previewStyle.transform).toBe(
		'translate(-50%, -50%) scale(-1, -1) rotate(90deg)',
	);
	expect(exportCrop).toEqual({
		left: 60,
		top: 130,
		width: 30,
		height: 50,
	});
});

test('maps every mirror combination into Mediabunny crop coordinates', () => {
	const dimensions = {width: 200, height: 100};
	const cropRect = {left: 20, top: 10, width: 50, height: 30};

	expect(
		makeCrop({
			cropRect,
			dimensions,
			mirrorHorizontal: false,
			mirrorVertical: false,
			videoCodec: 'vp9',
		}),
	).toEqual({left: 20, top: 10, width: 50, height: 30});
	expect(
		makeCrop({
			cropRect,
			dimensions,
			mirrorHorizontal: true,
			mirrorVertical: false,
			videoCodec: 'vp9',
		}),
	).toEqual({left: 130, top: 10, width: 50, height: 30});
	expect(
		makeCrop({
			cropRect,
			dimensions,
			mirrorHorizontal: false,
			mirrorVertical: true,
			videoCodec: 'vp9',
		}),
	).toEqual({left: 20, top: 60, width: 50, height: 30});
	expect(
		makeCrop({
			cropRect,
			dimensions,
			mirrorHorizontal: true,
			mirrorVertical: true,
			videoCodec: 'vp9',
		}),
	).toEqual({left: 130, top: 60, width: 50, height: 30});
});

test('maps a visible crop back to the thumbnail source after rotation and mirroring', () => {
	const cropBeforeMirror = getCropRectangleBeforeMirror({
		cropRect: {left: 10, top: 20, width: 30, height: 50},
		dimensions: {width: 100, height: 200},
		mirrorHorizontal: true,
		mirrorVertical: false,
	});

	expect(cropBeforeMirror).toEqual({
		left: 60,
		top: 20,
		width: 30,
		height: 50,
	});
	expect(
		getCropRectangleBeforeRotation({
			cropRect: cropBeforeMirror,
			rotation: 90,
			sourceDimensions: {width: 200, height: 100},
		}),
	).toEqual({
		left: 20,
		top: 10,
		width: 50,
		height: 30,
	});
});

import {expect, test} from 'bun:test';
import {getExtraFramesToCapture} from '../get-extra-frames-to-capture';

test('Extra frames to capture 0', () => {
	const {
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,
	} = getExtraFramesToCapture({
		fps: 30,
		compositionStart: 0,
		realFrameRange: [0, 30],
		forSeamlessAacConcatenation: true,
	});

	expect([
		...extraFramesToCaptureAssetsFrontend,
		...extraFramesToCaptureAssetsBackend,
	]).toEqual([31]);
});

test('Extra frames to capture 1', () => {
	const {
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,
	} = getExtraFramesToCapture({
		fps: 30,
		compositionStart: 100,
		realFrameRange: [100, 116],
		forSeamlessAacConcatenation: true,
	});

	expect([
		...extraFramesToCaptureAssetsFrontend,
		...extraFramesToCaptureAssetsBackend,
	]).toEqual([117, 118]);
});

test('Extra frames to capture 2', () => {
	const {
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,
	} = getExtraFramesToCapture({
		fps: 30,
		compositionStart: 100,
		realFrameRange: [151, 167],
		forSeamlessAacConcatenation: true,
	});

	expect([
		...extraFramesToCaptureAssetsFrontend,
		...extraFramesToCaptureAssetsBackend,
	]).toEqual([149, 150, 168, 169]);
});

test('Extra frames to capture 3', () => {
	const {
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,

		trimLeftOffset,
		trimRightOffset,
		chunkLengthInSeconds,
	} = getExtraFramesToCapture({
		fps: 30,
		compositionStart: 100,
		realFrameRange: [134, 150],
		forSeamlessAacConcatenation: true,
	});

	expect([
		...extraFramesToCaptureAssetsFrontend,
		...extraFramesToCaptureAssetsBackend,
	]).toEqual([132, 133, 151, 152]);
	expect(trimLeftOffset).toEqual(0.021333333333333114);
	expect(trimRightOffset).toEqual(-0.017333333333333437);
	expect(chunkLengthInSeconds).toEqual(0.6613333333333333);
});

test('Extra frames to capture 4', () => {
	const {
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,
		trimLeftOffset,
		trimRightOffset,
		chunkLengthInSeconds,
	} = getExtraFramesToCapture({
		compositionStart: 100,
		realFrameRange: [117, 133],
		fps: 30,
		forSeamlessAacConcatenation: true,
	});

	expect([
		...extraFramesToCaptureAssetsFrontend,
		...extraFramesToCaptureAssetsBackend,
	]).toEqual([116, 134, 135]);
	expect(trimLeftOffset).toEqual(0);
	expect(trimRightOffset).toEqual(-0.026666666666666807);
	expect(chunkLengthInSeconds).toEqual(0.6399999999999998);
});

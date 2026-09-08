import {expect, test} from 'bun:test';
import {
	canUseVideoMatting,
	VideoMattingUnsupportedReason,
} from '../can-use-video-matting';
import {getAvailableModels} from '../models';

test('returns public metadata without mutable internal model settings', () => {
	const models = getAvailableModels();

	expect(models).toEqual([
		{
			name: 'modnet',
			modelId: 'Xenova/modnet',
			purpose: 'person',
			webGpuDownloadSize: 25_889_088,
		},
		{
			name: 'ben2-base',
			modelId: 'onnx-community/BEN2-ONNX',
			purpose: 'general',
			webGpuDownloadSize: 219_122_146,
		},
	]);

	models[0].purpose = 'general';
	expect(getAvailableModels()[0].purpose).toBe('person');
});

test('requires shader-f16 only for the fp16 BEN2 model', async () => {
	const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
	const originalNavigator = Object.getOwnPropertyDescriptor(
		globalThis,
		'navigator',
	);
	const features = new Set<string>();
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {isSecureContext: true},
	});
	Object.defineProperty(globalThis, 'navigator', {
		configurable: true,
		value: {
			gpu: {
				requestAdapter: () => Promise.resolve({features}),
			},
		},
	});

	try {
		expect(await canUseVideoMatting({model: 'modnet'})).toEqual({
			supported: true,
		});
		expect(await canUseVideoMatting({model: 'ben2-base'})).toEqual({
			supported: false,
			reason: VideoMattingUnsupportedReason.ShaderF16Unavailable,
			detailedReason:
				'The video matting model "ben2-base" requires the WebGPU shader-f16 feature, which is unavailable on this adapter.',
		});

		features.add('shader-f16');
		expect(await canUseVideoMatting({model: 'ben2-base'})).toEqual({
			supported: true,
		});
	} finally {
		if (originalWindow) {
			Object.defineProperty(globalThis, 'window', originalWindow);
		} else {
			delete (globalThis as {window?: unknown}).window;
		}

		if (originalNavigator) {
			Object.defineProperty(globalThis, 'navigator', originalNavigator);
		} else {
			delete (globalThis as {navigator?: unknown}).navigator;
		}
	}
});

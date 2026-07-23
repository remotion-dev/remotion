import {useEffect, useState} from 'react';
import {HtmlInCanvas} from 'remotion';

export type HtmlInCanvasDocsDemoBranch = 'pending' | 'live' | 'fallback';
export type HtmlInCanvasDocsDemoRequirement =
	| 'html-in-canvas'
	| 'webgl2'
	| 'webgpu';

type Gpu = {
	requestAdapter(): Promise<unknown | null>;
};

const makeOffscreenCanvas = (): OffscreenCanvas | HTMLCanvasElement | null => {
	if (typeof OffscreenCanvas !== 'undefined') {
		return new OffscreenCanvas(1, 1);
	}

	if (typeof document !== 'undefined') {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		return canvas;
	}

	return null;
};

const isWebGl2SupportedOnOffscreenCanvas = (): boolean => {
	const canvas = makeOffscreenCanvas();
	if (!canvas) {
		return false;
	}

	try {
		const gl = canvas.getContext('webgl2', {
			alpha: true,
			premultipliedAlpha: true,
			antialias: false,
		});

		if (!gl) {
			return false;
		}

		gl.getExtension('WEBGL_lose_context')?.loseContext();
		return true;
	} catch {
		return false;
	}
};

const isWebGpuSupportedOnOffscreenCanvas = async (): Promise<boolean> => {
	if (typeof navigator === 'undefined') {
		return false;
	}

	const {gpu} = navigator as unknown as {gpu?: Gpu};
	if (!gpu) {
		return false;
	}

	const canvas = makeOffscreenCanvas();
	if (!canvas) {
		return false;
	}

	try {
		const context = (
			canvas as unknown as {
				getContext(id: 'webgpu'): unknown | null;
			}
		).getContext('webgpu');

		if (!context) {
			return false;
		}

		return Boolean(await gpu.requestAdapter());
	} catch {
		return false;
	}
};

const isRequirementSupported = (
	requirement: HtmlInCanvasDocsDemoRequirement,
): Promise<boolean> | boolean => {
	if (!HtmlInCanvas.isSupported()) {
		return false;
	}

	if (requirement === 'html-in-canvas') {
		return true;
	}

	if (requirement === 'webgl2') {
		return isWebGl2SupportedOnOffscreenCanvas();
	}

	return isWebGpuSupportedOnOffscreenCanvas();
};

/**
 * Avoid SSR/client hydration mismatch: support is only known after mount.
 */
export const useHtmlInCanvasDocsDemoBranch = (
	requirement: HtmlInCanvasDocsDemoRequirement = 'html-in-canvas',
): HtmlInCanvasDocsDemoBranch => {
	const [branch, setBranch] = useState<HtmlInCanvasDocsDemoBranch>('pending');

	useEffect(() => {
		let cancelled = false;

		const updateBranch = async () => {
			const supported = await isRequirementSupported(requirement);
			if (!cancelled) {
				setBranch(supported ? 'live' : 'fallback');
			}
		};

		updateBranch();

		return () => {
			cancelled = true;
		};
	}, [requirement]);

	return branch;
};

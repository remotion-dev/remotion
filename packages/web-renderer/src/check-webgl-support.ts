import type {CanRenderIssue} from './can-render-types';

export const checkWebGLSupport = (): CanRenderIssue | null => {
	try {
		const canvas = new OffscreenCanvas(1, 1);
		const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
		if (!gl) {
			return {
				type: 'webgl-unsupported',
				message: 'WebGL is not supported. 3D CSS transforms will fail.',
				severity: 'error',
			};
		}

		return null;
	} catch {
		return {
			type: 'webgl-unsupported',
			message: 'WebGL is not supported. 3D CSS transforms will fail.',
			severity: 'error',
		};
	}
};

import {
	createMotionBlurCompositor,
	getMotionBlurGpuDevice,
} from './motion-blur-compositor';

export {CameraMotionBlur, CameraMotionBlurProps} from './CameraMotionBlur';
export {
	HtmlInCanvasMotionBlur,
	HtmlInCanvasMotionBlurProps,
} from './HtmlInCanvasMotionBlur';
export {Trail, TrailProps} from './Trail';

export const MotionBlurInternals = {
	createMotionBlurCompositor,
	getMotionBlurGpuDevice,
};

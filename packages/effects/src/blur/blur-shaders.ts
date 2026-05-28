import {buildGaussianBlurFs} from '../gaussian-blur-shader.js';

export const BLUR_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const BLUR_FS_HORIZONTAL = buildGaussianBlurFs('horizontal');
export const BLUR_FS_VERTICAL = buildGaussianBlurFs('vertical');

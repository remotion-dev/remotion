import {
	AddEquation,
	ColorManagement,
	CustomBlending,
	HalfFloatType,
	LinearSRGBColorSpace,
	Mesh,
	NoBlending,
	OneFactor,
	OrthographicCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	UnsignedByteType,
	WebGLRenderTarget,
	WebGLRenderer,
} from 'three';
import {LineArt} from './line-art';
import {blurFor, createRig, stage, type Rig} from './shots';

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const ACCUMULATE = /* glsl */ `
uniform sampler2D map;
uniform float weight;
varying vec2 vUv;
void main() {
	gl_FragColor = texture2D(map, vUv) * weight;
}`;

const COPY = /* glsl */ `
uniform sampler2D map;
varying vec2 vUv;
void main() {
	gl_FragColor = texture2D(map, vUv);
}`;

const fullscreen = (material: ShaderMaterial) => {
	const scene = new Scene();
	const quad = new Mesh(new PlaneGeometry(2, 2), material);
	quad.frustumCulled = false;
	scene.add(quad);
	return scene;
};

export class BlueprintRenderer {
	private readonly renderer: WebGLRenderer;
	private readonly kit: LineArt;
	private readonly scene = new Scene();
	private readonly rig: Rig;
	private readonly sample: WebGLRenderTarget;
	private readonly accumulation: WebGLRenderTarget;
	private readonly quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
	private readonly accumulateMaterial: ShaderMaterial;
	private readonly copyMaterial: ShaderMaterial;
	private readonly accumulateScene: Scene;
	private readonly copyScene: Scene;

	private readonly pixelRatio: number;

	constructor(
		canvas: HTMLCanvasElement,
		width: number,
		height: number,
		pixelRatio: number,
	) {
		// Colours are authored in display space and must reach the canvas as-is.
		ColorManagement.enabled = false;
		this.pixelRatio = pixelRatio;
		this.renderer = new WebGLRenderer({
			canvas,
			alpha: true,
			antialias: true,
			premultipliedAlpha: true,
			preserveDrawingBuffer: true,
		});
		this.renderer.setPixelRatio(pixelRatio);
		this.renderer.setSize(width, height, false);
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.outputColorSpace = LinearSRGBColorSpace;
		this.renderer.autoClear = false;

		const bufferWidth = Math.round(width * pixelRatio);
		const bufferHeight = Math.round(height * pixelRatio);
		this.kit = new LineArt(bufferWidth, bufferHeight);
		this.rig = createRig(this.kit, this.scene, width, height);

		const floatTargets = this.renderer.extensions.has('EXT_color_buffer_float');
		this.sample = new WebGLRenderTarget(bufferWidth, bufferHeight, {
			samples: 4,
		});
		this.accumulation = new WebGLRenderTarget(bufferWidth, bufferHeight, {
			type: floatTargets ? HalfFloatType : UnsignedByteType,
		});
		this.accumulateMaterial = new ShaderMaterial({
			uniforms: {map: {value: this.sample.texture}, weight: {value: 1}},
			vertexShader: VERTEX,
			fragmentShader: ACCUMULATE,
			blending: CustomBlending,
			blendEquation: AddEquation,
			blendSrc: OneFactor,
			blendDst: OneFactor,
			depthTest: false,
			depthWrite: false,
		});
		this.copyMaterial = new ShaderMaterial({
			uniforms: {map: {value: this.accumulation.texture}},
			vertexShader: VERTEX,
			fragmentShader: COPY,
			blending: NoBlending,
			depthTest: false,
			depthWrite: false,
		});
		this.accumulateScene = fullscreen(this.accumulateMaterial);
		this.copyScene = fullscreen(this.copyMaterial);
	}

	setStyle(color: string, lineWidth: number, occluderColor = '#FFFFFF') {
		this.kit.setStyle(color, lineWidth * this.pixelRatio, occluderColor);
	}

	private renderAt(t: number) {
		const camera = stage(this.rig, t);
		this.renderer.clear();
		if (!camera) return;
		this.scene.updateMatrixWorld(true);
		this.kit.update(camera);
		this.renderer.render(this.scene, camera);
	}

	draw(t: number) {
		const r = this.renderer;
		const {samples, shutter, floor} = blurFor(t);
		if (samples <= 1) {
			r.setRenderTarget(null);
			this.renderAt(t);
			return;
		}
		r.setRenderTarget(this.accumulation);
		r.clear();
		this.accumulateMaterial.uniforms.weight.value = 1 / samples;
		for (let i = 0; i < samples; i++) {
			r.setRenderTarget(this.sample);
			this.renderAt(Math.max(floor, t - (shutter * i) / (samples - 1)));
			r.setRenderTarget(this.accumulation);
			r.render(this.accumulateScene, this.quadCamera);
		}
		r.setRenderTarget(null);
		r.clear();
		r.render(this.copyScene, this.quadCamera);
	}

	dispose() {
		this.kit.dispose();
		this.sample.dispose();
		this.accumulation.dispose();
		this.accumulateMaterial.dispose();
		this.copyMaterial.dispose();
		this.renderer.dispose();
		this.renderer.forceContextLoss();
	}
}

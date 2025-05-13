import * as ONNX from 'onnxruntime-web/all';
import {env} from './env';

export const OnnxTensor = ONNX.Tensor;

const DEVICE_TO_EXECUTION_PROVIDER_MAPPING = Object.freeze({
	auto: null, // Auto-detect based on device and environment
	gpu: null, // Auto-detect GPU
	cpu: 'cpu', // CPU
	wasm: 'wasm', // WebAssembly
	webgpu: 'webgpu', // WebGPU
	cuda: 'cuda', // CUDA
	dml: 'dml', // DirectML

	webnn: {name: 'webnn', deviceType: 'cpu'}, // WebNN (default)
	'webnn-npu': {name: 'webnn', deviceType: 'npu'}, // WebNN NPU
	'webnn-gpu': {name: 'webnn', deviceType: 'gpu'}, // WebNN GPU
	'webnn-cpu': {name: 'webnn', deviceType: 'cpu'}, // WebNN CPU
});

export const IS_WEBGPU_AVAILABLE =
	typeof navigator !== 'undefined' && 'gpu' in navigator;
const IS_WEBNN_AVAILABLE =
	typeof navigator !== 'undefined' && 'ml' in navigator;

/**
 * The list of supported devices, sorted by priority/performance.
 * @type {import("../utils/devices.js").DeviceType[]}
 */
const supportedDevices: any[] = [];

/** @type {ONNXExecutionProviders[]} */
let defaultDevices: any[] = [];

if (IS_WEBNN_AVAILABLE) {
	// TODO: Only push supported providers (depending on available hardware)
	supportedDevices.push('webnn-npu', 'webnn-gpu', 'webnn-cpu', 'webnn');
}

if (IS_WEBGPU_AVAILABLE) {
	supportedDevices.push('webgpu');
}

supportedDevices.push('wasm');
defaultDevices = ['wasm'];

const {InferenceSession} = ONNX;

/**
 * Map a device to the execution providers to use for the given device.
 * @param {import("../utils/devices.js").DeviceType|"auto"|null} [device=null] (Optional) The device to run the inference on.
 * @returns {ONNXExecutionProviders[]} The execution providers to use for the given device.
 */
export function deviceToExecutionProviders(device = null) {
	// Use the default execution providers if the user hasn't specified anything
	if (!device) return defaultDevices;

	// Handle overloaded cases
	switch (device) {
		case 'auto':
			return supportedDevices;
		case 'gpu':
			return supportedDevices.filter((x) =>
				['webgpu', 'cuda', 'dml', 'webnn-gpu'].includes(x),
			);
		default:
	}

	if (supportedDevices.includes(device)) {
		return [DEVICE_TO_EXECUTION_PROVIDER_MAPPING[device] ?? device];
	}

	throw new Error(
		`Unsupported device: "${device}". Should be one of: ${supportedDevices.join(', ')}.`,
	);
}

/**
 * To prevent multiple calls to `initWasm()`, we store the first call in a Promise
 * that is resolved when the first InferenceSession is created. Subsequent calls
 * will wait for this Promise to resolve before creating their own InferenceSession.
 * @type {Promise<any>|null}
 */
let wasmInitPromise: Promise<any> | null = null;

export async function createInferenceSession(
	buffer_or_path: Uint8Array | string,
	session_options: ONNX.InferenceSession.SessionOptions,
	session_config: Object,
) {
	if (wasmInitPromise) {
		// A previous session has already initialized the WASM runtime
		// so we wait for it to resolve before creating this new session.
		await wasmInitPromise;
	}

	const sessionPromise = InferenceSession.create(
		buffer_or_path as string,
		session_options,
	);
	wasmInitPromise ??= sessionPromise;
	const session = await sessionPromise;
	// @ts-expect-error

	session.config = session_config;
	console.log('created');
	return session;
}

/**
 * Check if an object is an ONNX tensor.
 * @param {any} x The object to check
 * @returns {boolean} Whether the object is an ONNX tensor.
 */
export function isONNXTensor(x: any) {
	return x instanceof ONNX.Tensor;
}

const ONNX_ENV = ONNX?.env;
if (ONNX_ENV?.wasm) {
	// Initialize wasm backend with suitable default settings.

	// (Optional) Set path to wasm files. This will override the default path search behavior of onnxruntime-web.
	// By default, we only do this if we are not in a service worker and the wasmPaths are not already set.

	const hasServiceWorkerGlobalScope =
		// @ts-expect-error
		typeof ServiceWorkerGlobalScope !== 'undefined' &&
		// @ts-expect-error
		self instanceof ServiceWorkerGlobalScope;

	const cas = !hasServiceWorkerGlobalScope && !ONNX_ENV.wasm.wasmPaths;
	if (cas) {
		ONNX_ENV.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${env.version}/dist/`;
	}

	// TODO: Add support for loading WASM files from cached buffer when we upgrade to onnxruntime-web@1.19.0
	// https://github.com/microsoft/onnxruntime/pull/21534

	// Users may wish to proxy the WASM backend to prevent the UI from freezing,
	// However, this is not necessary when using WebGPU, so we default to false.
	ONNX_ENV.wasm.proxy = false;
}

if (ONNX_ENV?.webgpu) {
	ONNX_ENV.webgpu.powerPreference = 'high-performance';
}

/**
 * Check if ONNX's WASM backend is being proxied.
 * @returns {boolean} Whether ONNX's WASM backend is being proxied.
 */
export function isONNXProxy() {
	// TODO: Update this when allowing non-WASM backends.
	return ONNX_ENV?.wasm?.proxy;
}

// Expose ONNX environment variables to `env.backends.onnx`
env.backends.onnx = ONNX_ENV;

console.log(ONNX_ENV);

import {isONNXProxy} from './onnx';
import {Tensor} from './tensor';

/**
 * Validate model inputs
 * @param {Object} session The InferenceSession object that will be run.
 * @param {Object} inputs The inputs to check.
 * @returns {Record<string, Tensor>} The checked inputs.
 * @throws {Error} If any inputs are missing.
 * @private
 */
export function validateInputs(session: any, inputs: any) {
	/**
	 * NOTE: Create either a shallow or deep copy based on `onnx.wasm.proxy`
	 * @type {Record<string, Tensor>}
	 */
	const checkedInputs = Object.create(null);
	const missingInputs = [];
	for (const inputName of session.inputNames) {
		const tensor = inputs[inputName];
		// Rare case where one of the model's input names corresponds to a built-in
		// object name (e.g., toString), which would cause a simple (!tensor) check to fail,
		// because it's not undefined but a function.
		if (!(tensor instanceof Tensor)) {
			missingInputs.push(inputName);
			continue;
		}

		// NOTE: When `env.wasm.proxy is true` the tensor is moved across the Worker
		// boundary, transferring ownership to the worker and invalidating the tensor.
		// So, in this case, we simply sacrifice a clone for it.
		checkedInputs[inputName] = isONNXProxy() ? tensor.clone() : tensor;
	}

	if (missingInputs.length > 0) {
		throw new Error(
			`An error occurred during model execution: "Missing the following inputs: ${missingInputs.join(', ')}.`,
		);
	}

	const numInputsProvided = Object.keys(inputs).length;
	const numInputsNeeded = session.inputNames.length;
	if (numInputsProvided > numInputsNeeded) {
		// No missing inputs, but too many inputs were provided.
		// Warn the user and ignore the extra inputs.
		const ignored = Object.keys(inputs).filter(
			(inputName) => !session.inputNames.includes(inputName),
		);
		// eslint-disable-next-line no-console
		console.warn(
			`WARNING: Too many inputs were provided (${numInputsProvided} > ${numInputsNeeded}). The following inputs will be ignored: "${ignored.join(', ')}".`,
		);
	}

	return checkedInputs;
}

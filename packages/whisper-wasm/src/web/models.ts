import {replaceTensors} from './replace-tensors';
import type {Tensor} from './tensor';
import {validateInputs} from './validate-inputs';

// Currently, Transformers.js doesn't support simultaneous execution of sessions in WASM/WebGPU.
// For this reason, we need to chain the inference calls (otherwise we get "Error: Session already started").
let webInferenceChain = Promise.resolve();
/**
 * Executes an InferenceSession using the specified inputs.
 * NOTE: `inputs` must contain at least the input names of the model.
 *  - If additional inputs are passed, they will be ignored.
 *  - If inputs are missing, an error will be thrown.
 *
 * @param {Object} session The InferenceSession object to run.
 * @param {Object} inputs An object that maps input names to input tensors.
 * @returns {Promise<Object>} A Promise that resolves to an object that maps output names to output tensors.
 * @private
 */
export async function sessionRun(session: any, inputs: any) {
	const checkedInputs = validateInputs(session, inputs);
	try {
		// pass the original ort tensor
		const ortFeed = Object.fromEntries(
			Object.entries(checkedInputs).map(([k, v]) => [k, (v as any).ort_tensor]),
		);
		const run = () => session.run(ortFeed);
		const output = await (webInferenceChain = webInferenceChain.then(run));
		return replaceTensors(output);
	} catch (e) {
		// Error messages can be long (nested) and uninformative. For this reason,
		// we apply minor formatting to show the most important information
		const formatted = Object.fromEntries(
			Object.entries(checkedInputs).map(([k, tensor]) => {
				// Extract these properties from the underlying ORT tensor
				const unpacked = {
					type: (tensor as Tensor).type,
					dims: (tensor as Tensor).dims,
					location: (tensor as Tensor).location,
				};
				if (unpacked.location !== 'gpu-buffer') {
					// Only return the data if it's not a GPU buffer
					// @ts-expect-error
					unpacked.data = (tensor as Tensor).data;
				}

				return [k, unpacked];
			}),
		);

		// This usually occurs when the inputs are of the wrong type.
		console.error(`An error occurred during model execution: "${e}".`);
		console.error('Inputs given to model:', formatted);
		throw e;
	}
}

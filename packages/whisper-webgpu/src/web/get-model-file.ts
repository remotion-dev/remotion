// https://huggingface.co/onnx-community/whisper-base/resolve/main/onnx/encoder_model.onnx
// https://huggingface.co/onnx-community/whisper-base/resolve/main/onnx/decoder_model_merged_q4.onnx
export const getModelFile = async (
	_modelFile: string,
	b: string,
): Promise<Uint8Array> => {
	const buf = 'https://huggingface.co/Xenova/whisper-base/resolve/main/' + b;
	const response = await fetch(buf);
	const arrayBuffer = await response.arrayBuffer();
	const uint8Array = new Uint8Array(arrayBuffer);
	return uint8Array;
};

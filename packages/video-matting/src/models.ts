const VIDEO_MATTING_MODELS = ['modnet', 'ben2-base'] as const;

export type VideoMattingModel = (typeof VIDEO_MATTING_MODELS)[number];

export type VideoMattingModelInfo = {
	name: VideoMattingModel;
	modelId: string;
	purpose: 'person' | 'general';
	webGpuDownloadSize: number;
};

type InternalVideoMattingModelInfo = VideoMattingModelInfo & {
	revision: string;
	dtype: 'fp32' | 'fp16';
	requiresShaderF16: boolean;
};

const MODEL_INFO: Record<VideoMattingModel, InternalVideoMattingModelInfo> = {
	modnet: {
		name: 'modnet',
		modelId: 'Xenova/modnet',
		purpose: 'person',
		webGpuDownloadSize: 25_889_088,
		revision: 'fa2fa546052fba4c08921230a26cc69a333fca12',
		dtype: 'fp32',
		requiresShaderF16: false,
	},
	'ben2-base': {
		name: 'ben2-base',
		modelId: 'onnx-community/BEN2-ONNX',
		purpose: 'general',
		webGpuDownloadSize: 219_122_146,
		revision: 'c552aa82688edce09f0ac9d2e31ad53d9d629010',
		dtype: 'fp16',
		requiresShaderF16: true,
	},
};

const HOSTED_MODEL_IDS: Record<VideoMattingModel, string> = {
	modnet: 'modnet-v1',
	'ben2-base': 'ben2-base-v1',
};

export const getAvailableModels = (): VideoMattingModelInfo[] => {
	return VIDEO_MATTING_MODELS.map((model) => {
		const {
			revision: _revision,
			dtype: _dtype,
			requiresShaderF16: _requiresShaderF16,
			...info
		} = MODEL_INFO[model];
		return {...info};
	});
};

export const getVideoMattingModelInfo = (
	model: VideoMattingModel,
): InternalVideoMattingModelInfo => {
	if (!Object.hasOwn(MODEL_INFO, model)) {
		throw new Error(
			`Unsupported video matting model "${model}". Available models: ${VIDEO_MATTING_MODELS.join(', ')}.`,
		);
	}

	return MODEL_INFO[model];
};

export const getHostedVideoMattingModelId = (
	model: VideoMattingModel,
): string => {
	return HOSTED_MODEL_IDS[model];
};

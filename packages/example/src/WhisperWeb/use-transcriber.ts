import {makeWorkerUrl} from '@remotion/whisper-web/worker-url';
import {useCallback, useMemo, useState} from 'react';

interface ProgressItem {
	file: string;
	loaded: number;
	progress: number;
	total: number;
	name: string;
	status: string;
}

interface TranscriberUpdateData {
	data: {
		text: string;
		chunks: {text: string; timestamp: [number, number | null]}[];
		tps: number;
	};
}

export interface TranscriberData {
	isBusy: boolean;
	tps?: number;
	text: string;
	chunks: {text: string; timestamp: [number, number | null]}[];
}

export interface Transcriber {
	onInputChange: () => void;
	isBusy: boolean;
	isModelLoading: boolean;
	progressItems: ProgressItem[];
	start: (audioData: Float32Array<ArrayBufferLike>) => void;
	output?: TranscriberData;
	model: string;
	setModel: (model: string) => void;
	multilingual: boolean;
	setMultilingual: (model: boolean) => void;
	subtask: string;
	setSubtask: (subtask: string) => void;
	language?: string;
	setLanguage: (language: string) => void;
}

export interface MessageEventHandler {
	(event: MessageEvent): void;
}

export function useWorker(messageEventHandler: MessageEventHandler): Worker {
	// Create new worker once and never again
	const [worker] = useState(() => createWorker(messageEventHandler));
	return worker;
}

const Constants = {
	SAMPLING_RATE: 16000,
	DEFAULT_AUDIO_URL: `https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/ted_60_16k.wav`,
	DEFAULT_MODEL: 'onnx-community/whisper-tiny',
	DEFAULT_SUBTASK: 'transcribe',
	DEFAULT_LANGUAGE: 'english',
	DEFAULT_QUANTIZED: false,
	DEFAULT_MULTILINGUAL: true,
};

function createWorker(messageEventHandler: MessageEventHandler): Worker {
	const worker = makeWorkerUrl();
	// Listen for messages from the Web Worker
	worker.addEventListener('message', messageEventHandler);
	return worker;
}

export function useTranscriber(): Transcriber {
	const [transcript, setTranscript] = useState<TranscriberData | undefined>(
		undefined,
	);
	const [isBusy, setIsBusy] = useState(false);
	const [isModelLoading, setIsModelLoading] = useState(false);

	const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

	const webWorker = useWorker((event) => {
		const message = event.data;
		console.log(message);
		// Update the state with the result
		switch (message.status) {
			case 'progress':
				// Model file progress: update one of the progress items.
				setProgressItems((prev) =>
					prev.map((item) => {
						if (item.file === message.file) {
							return {...item, progress: message.progress};
						}
						return item;
					}),
				);
				break;
			case 'update':
			case 'complete':
				const busy = message.status === 'update';
				const updateMessage = message as TranscriberUpdateData;
				setTranscript({
					isBusy: busy,
					text: updateMessage.data.text,
					tps: updateMessage.data.tps,
					chunks: updateMessage.data.chunks,
				});
				setIsBusy(busy);
				break;

			case 'initiate':
				// Model file start load: add a new progress item to the list.
				setIsModelLoading(true);
				setProgressItems((prev) => [...prev, message]);
				break;
			case 'ready':
				setIsModelLoading(false);
				break;
			case 'error':
				setIsBusy(false);
				alert(
					`An error occurred: "${message.data.message}". Please file a bug report.`,
				);
				break;
			case 'done':
				// Model file loaded: remove the progress item from the list.
				setProgressItems((prev) =>
					prev.filter((item) => item.file !== message.file),
				);
				break;

			default:
				// initiate/download/done
				break;
		}
	});

	const [model, setModel] = useState<string>(Constants.DEFAULT_MODEL);
	const [subtask, setSubtask] = useState<string>(Constants.DEFAULT_SUBTASK);
	const [multilingual, setMultilingual] = useState<boolean>(
		Constants.DEFAULT_MULTILINGUAL,
	);
	const [language, setLanguage] = useState<string>(Constants.DEFAULT_LANGUAGE);

	const onInputChange = useCallback(() => {
		setTranscript(undefined);
	}, []);

	const postRequest = useCallback(
		async (audioData: Float32Array<ArrayBufferLike>) => {
			if (audioData) {
				webWorker.postMessage({
					audio: audioData,
					model,
					multilingual,
					subtask: multilingual ? subtask : null,
					language: multilingual && language !== 'auto' ? language : null,
				});
			}
		},
		[webWorker, model, multilingual, subtask, language],
	);

	const transcriber = useMemo(() => {
		return {
			onInputChange,
			isBusy,
			isModelLoading,
			progressItems,
			start: postRequest,
			output: transcript,
			model,
			setModel,
			multilingual,
			setMultilingual,
			subtask,
			setSubtask,
			language,
			setLanguage,
		};
	}, [
		isBusy,
		isModelLoading,
		progressItems,
		postRequest,
		transcript,
		model,
		multilingual,
		subtask,
		language,
	]);

	return transcriber;
}

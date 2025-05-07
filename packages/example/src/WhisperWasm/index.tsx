import {
	type WhisperWasmModel,
	deleteModel,
	downloadWhisperModel,
	getLoadedModels,
	transcribe,
} from '@remotion/whisper-wasm';
import {useCallback, useEffect, useState} from 'react';
import {staticFile} from 'remotion';

const audioFileUrl = staticFile('16khz.wav');

const model = 'base';

export const WhisperWasm = () => {
	const [loadedModels, setLoadedModels] = useState<WhisperWasmModel[]>([]);

	const fetchModels = useCallback(async () => {
		const models = await getLoadedModels();
		setLoadedModels(models);
	}, []);

	const onClick = useCallback(async () => {
		const {alreadyDownloaded} = await downloadWhisperModel({
			model,
			onProgress: (progress) => {
				console.log(progress);
			},
		});
		fetchModels();

		console.log({alreadyDownloaded});
	}, [fetchModels]);

	const onClickTranscribe = useCallback(async () => {
		const file = await fetch(audioFileUrl);
		const blob = await file.blob();
		const {transcription} = await transcribe({
			model,
			file: blob,
			logLevel: 'verbose',
			onProgress(p) {
				console.log({p});
			},
			onTranscribedChunks(transcription) {
				console.log('New transcription chunk', transcription);
			},
		});
		console.log('Final transcription', transcription);
	}, []);

	useEffect(() => {
		fetchModels();
	}, [fetchModels]);

	return (
		<div className="flex flex-col gap-2">
			<button
				style={{
					background: 'white',
				}}
				onClick={onClick}
			>
				Download
			</button>
			<button
				style={{
					background: 'white',
				}}
				onClick={onClickTranscribe}
			>
				Transcribe
			</button>
			<div>
				{loadedModels.map((model) => (
					<div key={model}>
						{model}
						<button
							onClick={async () => {
								await deleteModel(model);
								await fetchModels();
							}}
						>
							Delete
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

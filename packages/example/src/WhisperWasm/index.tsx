import {
	downloadWhisperModel,
	getLoadedModels,
	transcribe,
} from '@remotion/whisper-wasm';
import {WhisperModel} from '@remotion/whisper-wasm/src/constants';
import {useCallback, useEffect, useState} from 'react';
import {staticFile} from 'remotion';

export const WhisperWasm = () => {
	const [loadedModels, setLoadedModels] = useState<WhisperModel[]>([]);

	const onClick = useCallback(async () => {
		const {alreadyDownloaded} = await downloadWhisperModel({
			model: 'tiny',
			onProgress: (progress) => {
				console.log(progress);
			},
		});

		console.log({alreadyDownloaded});
	}, []);

	const onClickTranscribe = useCallback(async () => {
		const file = await fetch(staticFile('16khz.wav'));
		const blob = await file.blob();
		transcribe({
			model: 'tiny.en',
			file: blob,
			onProgress(p) {
				console.log(p);
			},
		});
	}, []);

	useEffect(() => {
		getLoadedModels().then((mod) => {
			setLoadedModels(mod);
		});
	}, []);

	return (
		<div>
			<button onClick={onClick}>Download</button>
			<button onClick={onClickTranscribe}>Transcribe</button>
			<div>
				{loadedModels.map((model) => (
					<div key={model}>{model}</div>
				))}
			</div>
		</div>
	);
};

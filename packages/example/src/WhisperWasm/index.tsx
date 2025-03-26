import {downloadWhisperModel, transcribe} from '@remotion/whisper-wasm';
import {useCallback} from 'react';
import {staticFile} from 'remotion';

export const WhisperWasm = () => {
	const onClick = useCallback(async () => {
		const {alreadyDownloaded} = await downloadWhisperModel({
			model: 'tiny.en',
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

	return (
		<div>
			<button onClick={onClick}>Download</button>
			<button onClick={onClickTranscribe}>Transcribe</button>
		</div>
	);
};

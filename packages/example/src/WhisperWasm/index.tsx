import {parseMediaOnWebWorker} from '@remotion/media-parser/worker';
import {downloadWhisperModel, transcribe} from '@remotion/whisper-wasm';
import {useCallback} from 'react';
import {staticFile} from 'remotion';

export const WhisperWasm = () => {
	const onClick = useCallback(() => {
		downloadWhisperModel({model: 'tiny.en'});
	}, []);

	const onClickTranscribe = useCallback(async () => {
		const file = await fetch(staticFile('16khz.wav'));
		const blob = await file.blob();
		transcribe({
			file: blob,
			onProgress(p) {
				console.log(p);
			},
		});
	}, []);

	const onClickMedia = useCallback(async () => {
		const blob = await parseMediaOnWebWorker({
			src: new URL(staticFile('16khz.wav'), window.location.origin).toString(),
			fields: {
				durationInSeconds: true,
			},
		});
		console.log(blob);
	}, []);

	return (
		<div>
			<button onClick={onClickMedia}>media</button>
			<button onClick={onClick}>Download</button>
			<button onClick={onClickTranscribe}>Transcribe</button>
		</div>
	);
};

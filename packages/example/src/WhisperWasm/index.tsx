import {downloadWhisperModel} from '@remotion/whisper-wasm';
import {useCallback} from 'react';

export const WhisperWasm = () => {
	const onClick = useCallback(() => {
		downloadWhisperModel();
	}, []);

	return (
		<div>
			<button onClick={onClick}>Download</button>
		</div>
	);
};

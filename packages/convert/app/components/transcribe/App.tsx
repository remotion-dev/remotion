import type {TranscriptionJson} from '@remotion/whisper-web';
import {useState} from 'react';
import Display from './display';
import DownloadModel from './downloadModel';
import TranscribeAudio from './transcribeAudio';

const Transcribe = () => {
	const [transcriptionCompleted, setTranscriptionCompleted] = useState(false);
	const [modelDownloading, setModelDownloading] = useState(false);
	const [result, setResult] = useState<TranscriptionJson | null>(null);
	const [file, setFile] = useState<File | null>(null);

	return (
		<>
			<div
				style={{
					padding: 15,
					left: 20,
					borderRadius: 15,
					gap: 30,
					alignItems: 'center',
					top: 20,
				}}
			>
				<DownloadModel setDownloadingModel={setModelDownloading} />
				<TranscribeAudio
					{...{
						setFile,
						setResult,
						modelDownloading,
						file,
						setTranscriptionCompleted,
					}}
				/>
			</div>
			{transcriptionCompleted && <Display audio={file} result={result} />}
		</>
	);
};

export default Transcribe;

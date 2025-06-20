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
			<div className="h-8 lg:h-0 lg:w-8" />
			<div className="w-full lg:w-[350px]">
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
				{transcriptionCompleted && result && (
					<Display audio={file} result={result} />
				)}
			</div>
		</>
	);
};

export default Transcribe;

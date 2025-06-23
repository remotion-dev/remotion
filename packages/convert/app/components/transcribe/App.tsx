import type {DownloadWhisperModelParams} from '@remotion/whisper-web';
import React, {useState} from 'react';
import type {Source} from '~/lib/convert-state';
import type {Caption} from '../../../../captions/dist';
import Display from './display';
import DownloadModel from './downloadModel';
import TranscribeAudio from './transcribeAudio';

const Transcribe: React.FC<{
	readonly src: Source;
	readonly name: string;
}> = ({src, name}) => {
	const [, setTranscriptionCompleted] = useState(false);
	const [result, setResult] = useState<Caption[]>([]);
	const [transcribing, setTranscribing] = useState(false);

	const [selectedModel, setSelectedModel] =
		useState<DownloadWhisperModelParams['model']>('small.en');

	return (
		<>
			<div className="h-8 lg:h-0 lg:w-8" />
			<div className="w-full lg:w-[350px]">
				{transcribing ? null : (
					<>
						<DownloadModel
							selectedModel={selectedModel}
							setSelectedModel={setSelectedModel}
						/>
						<div className="h-4" />
					</>
				)}
				<TranscribeAudio
					source={src}
					setResult={setResult}
					setTranscriptionCompleted={setTranscriptionCompleted}
					selectedModel={selectedModel}
					setTranscribing={setTranscribing}
					transcribing={transcribing}
					name={name}
				/>
				{result ? <Display result={result} /> : null}
			</div>
		</>
	);
};

export default Transcribe;

import type MediaFox from '@mediafox/core';
import type {DownloadWhisperModelParams} from '@remotion/whisper-web';
import React, {useState} from 'react';
import type {Source} from '~/lib/convert-state';
import Display from './display';
import DownloadModel from './downloadModel';
import type {TranscriptionState} from './state';
import TranscribeAudio from './transcribeAudio';

const Transcribe: React.FC<{
	readonly src: Source;
	readonly name: string;
	readonly mediaFox: MediaFox;
}> = ({src, name, mediaFox}) => {
	const [state, setState] = useState<TranscriptionState>({type: 'idle'});

	const [selectedModel, setSelectedModel] =
		useState<DownloadWhisperModelParams['model']>('tiny.en');

	return (
		<>
			<div className="h-8 lg:h-0 lg:w-8" />
			<div className="w-full lg:w-[350px]">
				{state.type === 'idle' || state.type === 'initializing' ? (
					<>
						<DownloadModel
							selectedModel={selectedModel}
							setSelectedModel={setSelectedModel}
							disabled={state.type === 'initializing'}
						/>
						<div className="h-4" />
					</>
				) : null}
				<TranscribeAudio
					source={src}
					selectedModel={selectedModel}
					name={name}
					state={state}
					setState={setState}
				/>
				{state.type === 'transcribing' ? <div className="h-4" /> : null}
				{state.type === 'done' || state.type === 'transcribing' ? (
					<Display result={state.result} mediaFox={mediaFox} />
				) : null}
			</div>
		</>
	);
};

export default Transcribe;

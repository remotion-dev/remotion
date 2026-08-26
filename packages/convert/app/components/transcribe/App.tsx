import {
	getAvailableModels,
	isWhisperModelCached,
	type WhisperWebGpuModel,
} from '@remotion/whisper-webgpu';
import React, {useEffect, useState} from 'react';
import type {Source} from '~/lib/convert-state';
import Display from './display';
import ModelSelector from './modelSelector';
import type {TranscriptionState} from './state';
import TranscribeAudio from './transcribeAudio';

const Transcribe: React.FC<{
	readonly src: Source;
	readonly name: string;
	readonly playbackTime: number;
}> = ({src, name, playbackTime}) => {
	const [state, setState] = useState<TranscriptionState>({type: 'idle'});

	const [selectedModel, setSelectedModel] =
		useState<WhisperWebGpuModel>('tiny.en');
	const [cachedModels, setCachedModels] = useState<
		WhisperWebGpuModel[] | null
	>(null);

	useEffect(() => {
		if (state.type !== 'idle' && state.type !== 'error') {
			return;
		}

		let cancelled = false;
		Promise.all(
			getAvailableModels().map(async ({name: modelName}) => {
				const cached = await isWhisperModelCached({
					model: modelName,
					backend: 'webgpu',
				}).catch(() => false);
				return cached ? modelName : null;
			}),
		).then((models) => {
			if (!cancelled) {
				setCachedModels(
					models.filter((model): model is WhisperWebGpuModel => model !== null),
				);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [state.type]);

	return (
		<>
			<div className="h-8 lg:h-0 lg:w-8" />
			<div className="w-full lg:w-[350px]">
				{state.type === 'idle' ||
				state.type === 'initializing' ||
				state.type === 'error' ? (
					<>
						<ModelSelector
							selectedModel={selectedModel}
							setSelectedModel={setSelectedModel}
							disabled={state.type === 'initializing'}
							cachedModels={cachedModels}
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
				{state.type === 'done' ? (
					<Display result={state.result} time={playbackTime} />
				) : null}
			</div>
		</>
	);
};

export default Transcribe;

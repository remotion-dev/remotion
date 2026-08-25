import {
	loadWhisperModel,
	resampleTo16Khz,
	toCaptions,
	transcribe,
	type WhisperWebGpuModel,
} from '@remotion/whisper-webgpu';
import {useCallback} from 'react';
import type {Source} from '~/lib/convert-state';
import {formatBytes} from '~/lib/format-bytes';
import {Button} from '../ui/button';
import {Card} from '../ui/card';
import type {TranscriptionState} from './state';

const sourceToBlob = (source: Source) => {
	if (source.type === 'file') {
		return source.file;
	}

	return fetch(source.url).then((r) => r.blob());
};

export default function TranscribeAudio({
	source,
	selectedModel,
	name,
	state,
	setState,
}: {
	readonly source: Source;
	readonly selectedModel: WhisperWebGpuModel;
	readonly name: string;
	readonly state: TranscriptionState;
	readonly setState: React.Dispatch<React.SetStateAction<TranscriptionState>>;
}) {
	const onClick = useCallback(async () => {
		setState(() => ({
			type: 'initializing',
		}));

		try {
			const waveform = await resampleTo16Khz({
				file: await sourceToBlob(source),
			});

			await loadWhisperModel({
				backend: 'webgpu',
				model: selectedModel,
				onProgress: (progress) =>
					setState(() => ({
						type: 'downloading-model',
						progress,
					})),
			});

			setState(() => ({
				type: 'transcribing',
			}));

			const transcription = await transcribe({
				backend: 'webgpu',
				channelWaveform: waveform,
				model: selectedModel,
			});

			setState(() => ({
				type: 'done',
				result: toCaptions({whisperWebGpuOutput: transcription}).captions,
			}));
		} catch (error) {
			setState({
				type: 'error',
				message: error instanceof Error ? error.message : String(error),
			});
		}
	}, [selectedModel, source, setState]);

	return (
		<div>
			{state.type === 'downloading-model' ? (
				<Card className="overflow-hidden">
					<>
						<div className="h-5 overflow-hidden">
							<div
								className="w-[50%] h-5 bg-brand"
								style={{
									width: `${(state.progress.progress ?? 0) * 100}%`,
								}}
							/>
						</div>
						<div className="border-b-2 border-black" />
						<div className="p-2">
							<div>
								<strong className="font-brand ">
									Downloading model {selectedModel}
								</strong>
							</div>
							<div className="tabular-nums text-muted-foreground font-brand text-sm">
								<span>
									{state.progress.progress === null
										? state.progress.status
										: `${Math.round(state.progress.progress * 100)}%`}{' '}
									{state.progress.loadedBytes === null
										? null
										: formatBytes(state.progress.loadedBytes)}
								</span>
							</div>
						</div>
					</>
				</Card>
			) : null}
			{state.type === 'transcribing' ? (
				<Card className="overflow-hidden">
					<>
						<div className="h-5 overflow-hidden bg-muted">
							<div className="h-5 w-1/2 animate-pulse bg-brand" />
						</div>
						<div className="border-b-2 border-black" />
						<div className="p-2">
							<div>
								<strong className="font-brand">Transcribing {name}</strong>
							</div>
							<div className="tabular-nums text-muted-foreground font-brand text-sm">
								<span>Using WebGPU</span>
							</div>
						</div>
					</>
				</Card>
			) : null}
			{state.type === 'done' ? (
				<>
					<Card className="p-3 text-sm text-muted-foreground">
						Transcribed with WebGPU
						{state.result.length === 0 ? ' · No speech detected' : null}
					</Card>
					<div className="h-4" />
				</>
			) : null}
			{state.type === 'error' ? (
				<>
					<Card className="border-red-500 p-3 text-sm text-red-700">
						{state.message}
					</Card>
					<div className="h-4" />
				</>
			) : null}
			{state.type === 'idle' ||
			state.type === 'initializing' ||
			state.type === 'error' ? (
				<Button
					type="button"
					className="block w-full disabled:opacity-50"
					variant="brand"
					disabled={state.type === 'initializing'}
					onClick={onClick}
					data-disabled={state.type === 'initializing'}
				>
					{state.type === 'initializing'
						? 'Initializing...'
						: state.type === 'error'
							? 'Try again'
							: 'Transcribe'}
				</Button>
			) : null}
		</div>
	);
}

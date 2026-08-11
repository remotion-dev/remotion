import type {WhisperWebModel} from '@remotion/whisper-web';
import {
	downloadWhisperModel,
	resampleTo16Khz,
	toCaptions,
	transcribe,
} from '@remotion/whisper-web';
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
	readonly selectedModel: WhisperWebModel;
	readonly name: string;
	readonly state: TranscriptionState;
	readonly setState: React.Dispatch<React.SetStateAction<TranscriptionState>>;
}) {
	const onClick = useCallback(async () => {
		setState(() => ({
			type: 'initializing',
		}));

		const waveform = await resampleTo16Khz({
			file: await sourceToBlob(source),
		});

		await downloadWhisperModel({
			model: selectedModel,
			onProgress: (whisperProgress) =>
				setState(() => ({
					type: 'downloading-model',
					progress: whisperProgress,
				})),
		});

		setState(() => ({
			type: 'transcribing',
			result: [],
			progress: 0,
		}));

		transcribe({
			channelWaveform: waveform,
			model: selectedModel,
			threads: 9,
			onTranscriptionChunk: (e) => {
				setState((prevState) => ({
					type: 'transcribing',
					result: [
						...(prevState.type === 'transcribing' || prevState.type === 'done'
							? prevState.result
							: []),
						...toCaptions({whisperWebOutput: e}).captions,
					],
					progress: 0,
				}));
			},
			onProgress: (p) =>
				setState((prevState) => {
					if (prevState.type !== 'transcribing') {
						return prevState;
					}

					return {
						type: 'transcribing',
						result: prevState.result,
						progress: p,
					};
				}),
		}).then(() => {
			setState((prevState) => {
				if (prevState.type !== 'transcribing') {
					return prevState;
				}

				return {
					type: 'done',
					result: prevState.result,
				};
			});
		});
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
									width: (state.progress.progress ?? 0) * 100 + '%',
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
									{Math.round(state.progress.progress * 100)}%{' '}
									{formatBytes(state.progress.downloadedBytes)}
								</span>
							</div>
						</div>
					</>
				</Card>
			) : null}
			{state.type === 'transcribing' ? (
				<Card className="overflow-hidden">
					<>
						<div className="h-5 overflow-hidden">
							<div
								className="w-[50%] h-5 bg-brand"
								style={{
									width: (state.progress ?? 0) * 100 + '%',
								}}
							/>
						</div>
						<div className="border-b-2 border-black" />
						<div className="p-2">
							<div>
								<strong className="font-brand ">Transcribing {name}</strong>
							</div>
							<div className="tabular-nums text-muted-foreground font-brand text-sm">
								<span>{Math.round(state.progress * 100)}%</span>
							</div>
						</div>
					</>
				</Card>
			) : null}
			{state.type === 'idle' || state.type === 'initializing' ? (
				<Button
					type="button"
					className="block w-full disabled:opacity-50"
					variant="brand"
					disabled={state.type === 'initializing'}
					onClick={onClick}
					data-disabled={state.type === 'initializing'}
				>
					{state.type === 'initializing' ? 'Initializing...' : 'Transcribe'}
				</Button>
			) : null}
		</div>
	);
}

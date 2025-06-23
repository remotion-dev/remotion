import type {Caption} from '@remotion/captions';
import type {
	DownloadWhisperModelProgress,
	WhisperWebModel,
} from '@remotion/whisper-web';
import {
	downloadWhisperModel,
	resampleTo16Khz,
	toCaptions,
	transcribe,
} from '@remotion/whisper-web';
import {useCallback, useState} from 'react';
import type {Source} from '~/lib/convert-state';
import {formatBytes} from '~/lib/format-bytes';
import {Button} from '../ui/button';
import {Card} from '../ui/card';

const sourceToBlob = (source: Source) => {
	if (source.type === 'file') {
		return source.file;
	}

	return fetch(source.url).then((r) => r.blob());
};

export default function TranscribeAudio({
	setResult,
	setTranscriptionCompleted,
	source,
	selectedModel,
	setTranscribing,
	transcribing,
	name,
}: {
	readonly setResult: React.Dispatch<React.SetStateAction<Caption[]>>;
	readonly setTranscriptionCompleted: (completed: boolean) => void;
	readonly source: Source;
	readonly selectedModel: WhisperWebModel;
	readonly setTranscribing: (transcribing: boolean) => void;
	readonly transcribing: boolean;
	readonly name: string;
}) {
	const [progress, setProgress] = useState(0);
	const [modelDownloadProgress, setModelDownloadProgress] =
		useState<DownloadWhisperModelProgress | null>(null);

	const onClick = useCallback(async () => {
		setTranscribing(true);

		const waveform = await resampleTo16Khz({
			file: await sourceToBlob(source),
		});

		await downloadWhisperModel({
			model: selectedModel,
			onProgress: (whisperProgress) =>
				setModelDownloadProgress(whisperProgress),
		});

		transcribe({
			channelWaveform: waveform,
			model: selectedModel,
			threads: 9,
			onTranscriptionChunk: (e) => {
				setResult((r) => {
					const captions = toCaptions({whisperWebOutput: e});
					return [...(r ?? []), ...captions.captions];
				});
			},
			onProgress: (p) => setProgress(p),
		}).then(() => {
			setTranscribing(false);
			setTranscriptionCompleted(true);
			setProgress(0);
		});
	}, [
		selectedModel,
		source,
		setResult,
		setTranscribing,
		setTranscriptionCompleted,
		setProgress,
	]);

	return (
		<div>
			{transcribing ? (
				<>
					{modelDownloadProgress ? (
						<Card className="overflow-hidden">
							<>
								<div className="h-5 overflow-hidden">
									{modelDownloadProgress ? (
										<div
											className="w-[50%] h-5 bg-brand"
											style={{
												width:
													(modelDownloadProgress.progress ?? 0) * 100 + '%',
											}}
										/>
									) : null}
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
											{Math.round(modelDownloadProgress.progress * 100)}%{' '}
											{formatBytes(modelDownloadProgress.downloadedBytes)}
										</span>
									</div>
								</div>
							</>
						</Card>
					) : null}
					<div className="h-4" />
					<Card className="overflow-hidden">
						<>
							<div className="h-5 overflow-hidden">
								{progress ? (
									<div
										className="w-[50%] h-5 bg-brand"
										style={{
											width: (progress ?? 0) * 100 + '%',
										}}
									/>
								) : null}
							</div>
							<div className="border-b-2 border-black" />
							<div className="p-2">
								<div>
									<strong className="font-brand ">Transcribing {name}</strong>
								</div>
								<div className="tabular-nums text-muted-foreground font-brand text-sm">
									<span>{Math.round(progress * 100)}%</span>
								</div>
							</div>
						</>
					</Card>
				</>
			) : (
				<Button
					type="button"
					disabled={transcribing}
					className="block w-full"
					variant="brand"
					onClick={onClick}
				>
					Transcribe
				</Button>
			)}
		</div>
	);
}

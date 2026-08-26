import {
	canUseWhisperWebGpu,
	getAvailableModels,
	resampleTo16Khz,
	toCaptions,
	transcribe,
	type WhisperWebGpuModel,
} from '@remotion/whisper-webgpu';
import {useCallback, useMemo, useState} from 'react';

const audioFileUrl = 'https://remotion.media/16khz.wav';

const formatMegabytes = (bytes: number) => {
	return `${Math.round(bytes / 1_000_000)} MB`;
};

export const WhisperWebGpu = () => {
	const models = useMemo(() => getAvailableModels(), []);
	const [selectedModel, setSelectedModel] =
		useState<WhisperWebGpuModel>('small.en');
	const [status, setStatus] = useState('Ready to transcribe the sample audio.');
	const [result, setResult] = useState('');
	const [isTranscribing, setIsTranscribing] = useState(false);
	const selectedModelInfo = models.find(
		(model) => model.name === selectedModel,
	);

	const onTranscribe = useCallback(async () => {
		setIsTranscribing(true);
		setResult('');

		try {
			const support = await canUseWhisperWebGpu();
			if (!support.supported) {
				throw new Error(support.detailedReason);
			}

			setStatus('Fetching audio for WebGPU transcription...');
			const response = await fetch(audioFileUrl);
			if (!response.ok) {
				throw new Error(`Could not fetch audio: HTTP ${response.status}`);
			}

			setStatus('Decoding and resampling audio...');
			const channelWaveform = await resampleTo16Khz({
				file: await response.blob(),
				onProgress: (progress) => {
					setStatus(`Resampling audio... ${Math.round(progress * 100)}%`);
				},
			});

			setStatus(`Loading ${selectedModel} and transcribing...`);
			const transcription = await transcribe({
				channelWaveform,
				model: selectedModel,
				onModelLoadProgress: (progress) => {
					if (progress.progress !== null) {
						setStatus(
							`Loading ${selectedModel}... ${Math.round(progress.progress * 100)}%`,
						);
					}
				},
			});
			const {captions} = toCaptions({whisperWebGpuOutput: transcription});
			setStatus(`Done: ${captions.length} timestamped words.`);
			setResult(
				captions
					.map(
						(caption) =>
							`[${(caption.startMs / 1000).toFixed(2)}–${(caption.endMs / 1000).toFixed(2)}]${caption.text}`,
					)
					.join('\n'),
			);
		} catch (error) {
			setStatus(error instanceof Error ? error.message : String(error));
		} finally {
			setIsTranscribing(false);
		}
	}, [selectedModel]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950 p-8 text-slate-900">
			<div className="w-full max-w-2xl space-y-5 rounded-xl bg-white p-7 shadow-2xl">
				<div>
					<h1 className="text-2xl font-semibold">Whisper WebGPU</h1>
					<p className="mt-1 text-sm text-slate-600">
						Timestamped Transformers.js transcription for Remotion captions.
					</p>
				</div>

				<label className="block text-sm font-medium" htmlFor="webgpu-model">
					Model
					<select
						className="mt-2 block w-full rounded-md border border-slate-300 p-2"
						disabled={isTranscribing}
						id="webgpu-model"
						onChange={(event) => {
							setSelectedModel(event.target.value as WhisperWebGpuModel);
						}}
						value={selectedModel}
					>
						{models.map((model) => (
							<option key={model.name} value={model.name}>
								{model.name} · {Math.round(model.parameters / 1_000_000)}M ·{' '}
								{formatMegabytes(model.webGpuDownloadSize)} WebGPU
							</option>
						))}
					</select>
				</label>

				{selectedModelInfo ? (
					<p className="rounded-md bg-slate-100 p-3 text-sm text-slate-700">
						{selectedModelInfo.multilingual ? 'Multilingual' : 'English-only'} ·{' '}
						{formatMegabytes(selectedModelInfo.webGpuDownloadSize)} download
					</p>
				) : null}

				<button
					className="w-full rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
					disabled={isTranscribing}
					onClick={onTranscribe}
					type="button"
				>
					{isTranscribing ? 'Transcribing…' : 'Transcribe sample audio'}
				</button>

				<div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">
					{status}
				</div>
				{result ? (
					<pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-xs text-slate-100">
						{result}
					</pre>
				) : null}
			</div>
		</div>
	);
};

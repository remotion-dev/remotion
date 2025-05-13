import {
	type WhisperWebModel,
	deleteModel,
	downloadWhisperModel,
	getLoadedModels,
	resampleTo16Khz,
	transcribe,
} from '@remotion/whisper-web';
import {useCallback, useEffect, useState} from 'react';
import {staticFile} from 'remotion';

const audioFileUrl = staticFile('16khz.wav');

// Define available models
const AVAILABLE_MODELS: WhisperWebModel[] = [
	'tiny.en',
	'tiny',
	'base.en',
	'base',
	'small.en',
	'small',
];

export const WhisperWeb = () => {
	const [loadedModels, setLoadedModels] = useState<WhisperWebModel[]>([]);
	const [statusMessage, setStatusMessage] = useState<string>('');
	const [selectedModel, setSelectedModel] = useState<WhisperWebModel>(
		AVAILABLE_MODELS[0],
	);

	const fetchModels = useCallback(async () => {
		const models = await getLoadedModels();
		setLoadedModels(models);
	}, []);

	const onDownloadSelectedModel = useCallback(async () => {
		setStatusMessage(`Downloading ${selectedModel} model...`);
		try {
			const {alreadyDownloaded} = await downloadWhisperModel({
				model: selectedModel,
				onProgress: ({progress, totalBytes, downloadedBytes}) => {
					console.log({progress, totalBytes, downloadedBytes});
					setStatusMessage(
						`Downloading ${selectedModel} model... ${(progress * 100).toFixed(
							0,
						)}%`,
					);
				},
			});
			await fetchModels();
			setStatusMessage(
				alreadyDownloaded
					? `${selectedModel} model already downloaded.`
					: `${selectedModel} model downloaded successfully!`,
			);
			console.log({alreadyDownloaded});
		} catch (e) {
			console.error(e);
			setStatusMessage(`Error downloading ${selectedModel} model.`);
		}
	}, [fetchModels, selectedModel]);

	const onClickTranscribe = useCallback(async () => {
		if (!loadedModels.includes(selectedModel)) {
			setStatusMessage(
				`Model ${selectedModel} is not downloaded. Please download it first.`,
			);
			return;
		}
		setStatusMessage('Preparing to transcribe...');
		try {
			const file = await fetch(audioFileUrl);
			const blob = await file.blob();

			setStatusMessage('Resampling audio...');
			const channelWaveform = await resampleTo16Khz({
				file: blob,
				onProgress(progress) {
					console.log('Resampling progress:', progress);
					setStatusMessage(
						`Resampling audio... ${(progress * 100).toFixed(0)}%`,
					);
				},
			});

			setStatusMessage(`Transcribing with ${selectedModel} model...`);
			const {transcription} = await transcribe({
				model: selectedModel,
				channelWaveform,
				logLevel: 'verbose',
				onProgress(p) {
					console.log({p});
				},
				onTranscriptionChunk(transcriptionChunk) {
					console.log('New transcription chunk', transcriptionChunk);
					setStatusMessage(
						`Transcription in progress: "${transcriptionChunk
							.map((t) => t.text)
							.join('')}"`,
					);
				},
			});
			console.log('Final transcription', transcription);
			setStatusMessage(
				`Transcription complete: "${transcription.map((t) => t.text).join('')}"`,
			);
		} catch (e) {
			console.error(e);
			setStatusMessage('Error during transcription.');
		}
	}, [selectedModel, loadedModels]);

	const onDeleteModel = useCallback(
		async (modelToDelete: WhisperWebModel) => {
			setStatusMessage(`Deleting ${modelToDelete} model...`);
			try {
				await deleteModel(modelToDelete);
				await fetchModels();
				setStatusMessage(`${modelToDelete} model deleted.`);
			} catch (e) {
				console.error(e);
				setStatusMessage(`Error deleting ${modelToDelete} model.`);
			}
		},
		[fetchModels],
	);

	useEffect(() => {
		fetchModels();
	}, [fetchModels]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
			<div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-4">
				<div className="text-center text-2xl font-semibold text-gray-700">
					Whisper Web Demo
				</div>

				{statusMessage && (
					<div
						className="p-3 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg overflow-y-auto max-h-60"
						role="alert"
					>
						{statusMessage}
					</div>
				)}

				<div className="space-y-2">
					<label
						htmlFor="model-select"
						className="block text-sm font-medium text-gray-700"
					>
						Select Model:
					</label>
					<select
						id="model-select"
						value={selectedModel}
						onChange={(e) =>
							setSelectedModel(e.target.value as WhisperWebModel)
						}
						className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
					>
						{AVAILABLE_MODELS.map((modelName) => (
							<option key={modelName} value={modelName}>
								{modelName}
							</option>
						))}
					</select>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
						onClick={onDownloadSelectedModel}
						disabled={loadedModels.includes(selectedModel)}
					>
						{loadedModels.includes(selectedModel)
							? `Model '${selectedModel}' Downloaded`
							: `Download '${selectedModel}' Model`}
					</button>
					<button
						className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
						onClick={onClickTranscribe}
						disabled={!loadedModels.includes(selectedModel)}
					>
						Transcribe Audio
					</button>
				</div>

				<div>
					<h2 className="text-lg font-semibold text-gray-600 mb-2">
						Available Locally:
					</h2>
					{loadedModels.length > 0 ? (
						<ul className="space-y-2">
							{loadedModels.map((loadedModelItem) => (
								<li
									key={loadedModelItem}
									className="flex justify-between items-center p-3 bg-gray-50 rounded-md shadow-sm"
								>
									<span className="text-gray-700">{loadedModelItem}</span>
									<button
										className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded text-xs"
										onClick={async () => {
											await onDeleteModel(loadedModelItem);
										}}
									>
										Delete
									</button>
								</li>
							))}
						</ul>
					) : (
						<p className="text-gray-500">No models downloaded yet.</p>
					)}
				</div>
			</div>
		</div>
	);
};

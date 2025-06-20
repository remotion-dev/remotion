import {
	getLoadedModels,
	type DownloadWhisperModelParams,
} from '@remotion/whisper-web';
import {useEffect, useState} from 'react';

interface SelectTranscriptionModelProps {
	readonly loadingLoadedModels: boolean;
	readonly setLoadingLoadedModels: (value: boolean) => void;
	readonly setModelForTranscription: (
		value: DownloadWhisperModelParams['model'] | undefined,
	) => void;
	readonly modelDownloading: boolean;
	readonly transcribing: boolean;
}

export default function SelectTranscriptionModel({
	loadingLoadedModels,
	modelDownloading,
	setLoadingLoadedModels,
	transcribing,
	setModelForTranscription,
}: SelectTranscriptionModelProps) {
	const [modelsAvailable, setModelsAvailable] = useState<
		DownloadWhisperModelParams['model'][]
	>(['tiny.en']);
	useEffect(() => {
		if (modelDownloading) {
			return;
		}

		const loader = () => {
			setLoadingLoadedModels(true);
			getLoadedModels().then((data) => {
				setModelsAvailable(data);
				setLoadingLoadedModels(false);
				if (data.length === 0) {
					setModelForTranscription(undefined);
				} else {
					setModelForTranscription(data[0]);
				}
			});
		};

		loader();

		// eslint-disable-next-line
	}, [modelDownloading]);
	return (
		<select
			onChange={(e) =>
				setModelForTranscription(
					e.target.value as DownloadWhisperModelParams['model'],
				)
			}
			disabled={loadingLoadedModels || transcribing}
		>
			{modelsAvailable.map((model) => (
				<option key={model} value={model}>
					{model}
				</option>
			))}
		</select>
	);
}

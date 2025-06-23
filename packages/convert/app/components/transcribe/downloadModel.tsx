import {
	deleteModel,
	type DownloadWhisperModelParams,
	getAvailableModels,
	getLoadedModels,
	type WhisperWebModel,
} from '@remotion/whisper-web';
import {useCallback, useEffect, useState} from 'react';
import {formatBytes} from '../../lib/format-bytes';
import {Label} from '../ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';

export default function DownloadModel({
	selectedModel,
	setSelectedModel,
}: {
	readonly selectedModel: DownloadWhisperModelParams['model'];
	readonly setSelectedModel: (
		model: DownloadWhisperModelParams['model'],
	) => void;
}) {
	const [loadedModels, setLoadedModels] = useState<WhisperWebModel[]>([]);
	const availableModels = getAvailableModels();

	const fetchLoadedModels = useCallback(async () => {
		try {
			const models = await getLoadedModels();
			setLoadedModels(models);
		} catch {
			// Failed to fetch loaded models - continue with empty array
		}
	}, []);

	useEffect(() => {
		fetchLoadedModels();
	}, [fetchLoadedModels]);

	const handleDeleteModel = useCallback(
		async (model: WhisperWebModel) => {
			try {
				await deleteModel(model);
				await fetchLoadedModels(); // Refresh the loaded models list
			} catch {
				// Failed to delete model - user can try again
			}
		},
		[fetchLoadedModels],
	);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-end gap-2">
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label htmlFor="model">Whisper model</Label>
					<Select
						value={selectedModel}
						onValueChange={(v) =>
							setSelectedModel(v as DownloadWhisperModelParams['model'])
						}
					>
						<SelectTrigger id="model">
							<SelectValue placeholder="Select a model" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{availableModels.map(({name, downloadSize}) => {
									const isLoaded = loadedModels.includes(name);
									return (
										<SelectItem key={name} value={name}>
											<div className="flex w-full items-center justify-between">
												<div className="flex flex-col">
													<span className="font-medium">{name}</span>
													<span className="text-xs text-muted-foreground">
														{formatBytes(downloadSize)}
													</span>
												</div>
												{isLoaded && (
													<button
														type="button"
														className="ml-2 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															handleDeleteModel(name);
														}}
													>
														Delete
													</button>
												)}
											</div>
										</SelectItem>
									);
								})}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}

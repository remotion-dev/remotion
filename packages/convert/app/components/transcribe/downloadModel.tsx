import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@remotion/design';
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

export default function DownloadModel({
	selectedModel,
	setSelectedModel,
	disabled,
}: {
	readonly selectedModel: DownloadWhisperModelParams['model'];
	readonly setSelectedModel: (
		model: DownloadWhisperModelParams['model'],
	) => void;
	readonly disabled: boolean;
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
						disabled={disabled}
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
										<div key={name} className="flex w-full">
											<SelectItem value={name} className="flex w-full">
												<div className="flex w-full justify-between">
													<div className="text-left">
														<div className="font-medium">{name}</div>
														<div className="text-xs text-muted-foreground">
															{formatBytes(downloadSize)}
														</div>
													</div>
												</div>
											</SelectItem>{' '}
											{isLoaded && (
												<button
													type="button"
													className="rounded text-red-500 px-2 py-1 text-xs hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1"
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

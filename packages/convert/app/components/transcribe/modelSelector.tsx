import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@remotion/design';
import {
	getAvailableModels,
	type WhisperWebGpuModel,
} from '@remotion/whisper-webgpu';
import {formatBytes} from '../../lib/format-bytes';
import {Label} from '../ui/label';

export default function ModelSelector({
	selectedModel,
	setSelectedModel,
	disabled,
	cachedModels,
}: {
	readonly selectedModel: WhisperWebGpuModel;
	readonly setSelectedModel: (model: WhisperWebGpuModel) => void;
	readonly disabled: boolean;
	readonly cachedModels: WhisperWebGpuModel[] | null;
}) {
	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-end gap-2">
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label htmlFor="model">Whisper model</Label>
					<Select
						disabled={disabled}
						value={selectedModel}
						onValueChange={(value) =>
							setSelectedModel(value as WhisperWebGpuModel)
						}
					>
						<SelectTrigger id="model">
							<SelectValue placeholder="Select a model" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{getAvailableModels().map((model) => (
									<SelectItem key={model.name} value={model.name}>
										<div className="text-left">
											<div className="font-medium">{model.name}</div>
											<div className="text-xs text-muted-foreground">
												{formatBytes(model.webGpuDownloadSize)} WebGPU
												{cachedModels?.includes(model.name)
													? ' · Downloaded'
													: null}
											</div>
										</div>
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}

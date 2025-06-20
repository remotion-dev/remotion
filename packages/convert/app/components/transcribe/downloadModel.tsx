import {type DownloadWhisperModelParams} from '@remotion/whisper-web';
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
	const modelOptions: DownloadWhisperModelParams['model'][] = [
		'tiny.en',
		'tiny',
		'small',
		'small.en',
		'base',
		'base.en',
	];

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
								{modelOptions.map((model) => (
									<SelectItem key={model} value={model}>
										{model}
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

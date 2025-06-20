import {
	downloadWhisperModel,
	type DownloadWhisperModelParams,
} from '@remotion/whisper-web';
import {useState} from 'react';
import {Button} from '../ui/button';
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
	setDownloadingModel,
}: {
	readonly setDownloadingModel: (downloading: boolean) => void;
}) {
	const modelOptions: DownloadWhisperModelParams['model'][] = [
		'tiny.en',
		'tiny',
		'small',
		'small.en',
		'base',
		'base.en',
	];

	const [selectedModel, setSelectedModel] =
		useState<DownloadWhisperModelParams['model']>('tiny.en');
	const [downloadModelProgress, setDownloadProgress] = useState<number>(0);

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
				<Button
					variant="secondary"
					onClick={() => {
						setDownloadingModel(true);
						downloadWhisperModel({
							model: selectedModel,
							onProgress: (v) => setDownloadProgress(v.progress),
						}).then(() => setDownloadingModel(false));
					}}
				>
					Download model
				</Button>
			</div>
			{downloadModelProgress !== 0 && downloadModelProgress !== 1 && (
				<progress value={downloadModelProgress} max={1} />
			)}
			{downloadModelProgress === 1 && <span>done ✅</span>}
		</div>
	);
}

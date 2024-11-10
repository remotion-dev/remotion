import {
	ConvertMediaAudioCodec,
	ConvertMediaContainer,
	ConvertMediaVideoCodec,
} from '@remotion/webcodecs';
import React from 'react';
import {Container} from '~/lib/generate-new-name';
import {SupportedConfigs} from './get-supported-configs';
import {Checkbox} from './ui/checkbox';
import {Label} from './ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';

export const ConvertForm: React.FC<{
	readonly container: ConvertMediaContainer;
	readonly setContainer: React.Dispatch<
		React.SetStateAction<ConvertMediaContainer>
	>;
	readonly videoCodec: ConvertMediaVideoCodec;
	readonly setVideoCodec: React.Dispatch<
		React.SetStateAction<ConvertMediaVideoCodec>
	>;
	readonly audioCodec: ConvertMediaAudioCodec;
	readonly setAudioCodec: React.Dispatch<
		React.SetStateAction<ConvertMediaAudioCodec>
	>;
	readonly flipHorizontal: boolean;
	readonly setFlipHorizontal: React.Dispatch<React.SetStateAction<boolean>>;
	readonly flipVertical: boolean;
	readonly setFlipVertical: React.Dispatch<React.SetStateAction<boolean>>;
	readonly supportedConfigs: SupportedConfigs | null;
}> = ({
	container,
	setContainer,
	setVideoCodec,
	videoCodec,
	audioCodec,
	setAudioCodec,
	flipHorizontal,
	flipVertical,
	setFlipHorizontal,
	setFlipVertical,
	supportedConfigs,
}) => {
	const [showAdvanced, setShowAdvanced] = React.useState(false);
	console.log(supportedConfigs);

	return (
		<div className="gap-4 grid">
			<div>
				<Label htmlFor="container">Container</Label>
				<Select
					value={container}
					onValueChange={(v) => setContainer(v as Container)}
				>
					<SelectTrigger id="container">
						<SelectValue placeholder="Select a container" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="webm">WebM</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<div>
				<Label htmlFor="videoCodec">Video codec</Label>
				<Select
					value={videoCodec}
					onValueChange={(v) => setVideoCodec(v as ConvertMediaVideoCodec)}
				>
					<SelectTrigger id="videoCodec">
						<SelectValue placeholder="Select a video codec" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="vp8">VP8</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<div>
				<Label htmlFor="audioCodec">Audio codec</Label>
				<Select
					value={audioCodec}
					onValueChange={(a) => setAudioCodec(a as ConvertMediaAudioCodec)}
				>
					<SelectTrigger id="audioCodec">
						<SelectValue placeholder="Select a audio codec" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="opus">Opus</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			{showAdvanced ? (
				<>
					<div className="flex flex-row">
						<Checkbox
							checked={flipHorizontal}
							id="flipHorizontal"
							onCheckedChange={() => setFlipHorizontal((e) => !e)}
						/>
						<div className="w-2" />
						<div className="grid gap-1.5 leading-none">
							<label
								htmlFor="flipHorizontal"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Flip video horizontally
							</label>
						</div>
					</div>
					<div className="flex flex-row">
						<Checkbox
							checked={flipVertical}
							id="flipVertical"
							onCheckedChange={() => setFlipVertical((e) => !e)}
						/>
						<div className="w-2" />
						<div className="grid gap-1.5 leading-none">
							<label
								htmlFor="flipVertical"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Flip video vertically
							</label>
						</div>
					</div>
				</>
			) : (
				<div className="flex flex-row justify-center text-muted-foreground">
					<button
						type="button"
						className="font-brand"
						onClick={() => setShowAdvanced(true)}
					>
						Advanced settings
					</button>
				</div>
			)}
		</div>
	);
};

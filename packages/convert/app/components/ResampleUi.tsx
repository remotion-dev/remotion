import {Label} from './ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';

export const ResampleUi: React.FC<{
	sampleRate: number;
	setSampleRate: (sampleRate: number) => void;
	currentSampleRate: number | null;
}> = ({sampleRate, setSampleRate, currentSampleRate}) => {
	return (
		<div>
			<div className="h-4" />
			<Label htmlFor="sample-rate">Sample rate</Label>
			<Select
				value={String(sampleRate)}
				onValueChange={(val) => setSampleRate(Number(val))}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select a sample rate" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="16000">16.000 Hz</SelectItem>
					<SelectItem value="22050">22.050 Hz</SelectItem>
					<SelectItem value="24000">24.000 Hz</SelectItem>
					<SelectItem value="32000">32.000 Hz</SelectItem>
					<SelectItem value="44100">44.100 Hz</SelectItem>
					<SelectItem value="48000">48 Hz</SelectItem>
				</SelectContent>
			</Select>
			<div className="text-sm mt-2 text-muted-foreground">
				The current sample rate is {currentSampleRate} Hz.
			</div>
		</div>
	);
};

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@remotion/design';
import {Label} from './ui/label';

const formatSampleRate = (rate: number): string => {
	return `${(rate / 1000).toFixed(3)} Hz`;
};

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
					<SelectItem value="16000">{formatSampleRate(16000)}</SelectItem>
					<SelectItem value="22050">{formatSampleRate(22050)}</SelectItem>
					<SelectItem value="24000">{formatSampleRate(24000)}</SelectItem>
					<SelectItem value="32000">{formatSampleRate(32000)}</SelectItem>
					<SelectItem value="44100">{formatSampleRate(44100)}</SelectItem>
					<SelectItem value="48000">{formatSampleRate(48000)}</SelectItem>
				</SelectContent>
			</Select>
			<div className="text-sm mt-2 text-muted-foreground">
				The current sample rate is{' '}
				{currentSampleRate ? formatSampleRate(currentSampleRate) : 'unknown'}.
			</div>
		</div>
	);
};

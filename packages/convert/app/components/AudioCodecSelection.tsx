import {AudioOperation} from '@remotion/webcodecs';
import React from 'react';
import {AudioOperationOption} from './AudioOperationOption';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';

export const AudioCodecSelection: React.FC<{
	readonly audioTrackOptions: AudioOperation[];
	readonly index: number;
	readonly setIndex: (v: number) => void;
}> = ({audioTrackOptions, index, setIndex}) => {
	return (
		<Select value={String(index)} onValueChange={(v) => setIndex(Number(v))}>
			<SelectTrigger id="audioCodec">
				<SelectValue placeholder="Select a audio codec" />
			</SelectTrigger>
			<SelectContent>
				{audioTrackOptions.map((operation, i) => {
					return (
						<SelectGroup key={i}>
							<SelectItem
								// eslint-disable-next-line react/jsx-key
								value={String(i)}
							>
								<AudioOperationOption operation={operation} />
							</SelectItem>
						</SelectGroup>
					);
				})}
			</SelectContent>
		</Select>
	);
};

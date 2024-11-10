import {MediaParserAudioCodec} from '@remotion/media-parser';
import {AudioOperation} from '@remotion/webcodecs';
import React from 'react';
import {AudioCodecDropWarning} from './AudioCodecDropWarning';
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
	readonly currentAudioCodec: MediaParserAudioCodec | null;
}> = ({audioTrackOptions, index, setIndex, currentAudioCodec}) => {
	if (!currentAudioCodec) {
		throw new Error('No current audio codec, should not render this component');
	}

	const disabled = audioTrackOptions.length < 2;

	return (
		<>
			<Select
				disabled={disabled}
				value={String(index)}
				onValueChange={(v) => setIndex(Number(v))}
			>
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
									<AudioOperationOption
										currentAudioCodec={currentAudioCodec}
										operation={operation}
									/>
								</SelectItem>
							</SelectGroup>
						);
					})}
				</SelectContent>
			</Select>
			{disabled ? <AudioCodecDropWarning /> : null}
		</>
	);
};

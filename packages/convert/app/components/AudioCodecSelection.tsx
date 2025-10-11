import type {MediaParserAudioCodec} from '@remotion/media-parser';
import type {AudioOperation} from '@remotion/webcodecs';
import React from 'react';
import {getAudioOperationId} from '~/lib/operation-key';
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
	readonly index: string;
	readonly setIndex: (v: string) => void;
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
				value={index}
				onValueChange={(v) => setIndex(v)}
			>
				<SelectTrigger id="audioCodec">
					<SelectValue placeholder="Select a audio codec" />
				</SelectTrigger>
				<SelectContent>
					{audioTrackOptions.map((operation, i) => {
						return (
							// eslint-disable-next-line react/no-array-index-key
							<SelectGroup key={i}>
								<SelectItem
									key={getAudioOperationId(operation)}
									value={getAudioOperationId(operation)}
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

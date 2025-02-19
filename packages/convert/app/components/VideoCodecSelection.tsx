import type {MediaParserVideoCodec} from '@remotion/media-parser';
import type {VideoOperation} from '@remotion/webcodecs';
import React from 'react';
import {getVideoOperationId} from '~/lib/operation-key';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import {VideoOperationOption} from './VideoOperationOption';

export const VideoCodecSelection: React.FC<{
	readonly videoOperations: VideoOperation[];
	readonly index: string;
	readonly setIndex: (v: string) => void;
	readonly currentVideoCodec: MediaParserVideoCodec | null;
}> = ({videoOperations, index, setIndex, currentVideoCodec}) => {
	return (
		<Select
			disabled={videoOperations.length < 2}
			value={index}
			onValueChange={(v) => setIndex(v)}
		>
			<SelectTrigger id="videoCodec">
				<SelectValue placeholder="Select a video codec" />
			</SelectTrigger>
			<SelectContent>
				{videoOperations.map((operation, i) => {
					return (
						// eslint-disable-next-line react/no-array-index-key
						<SelectGroup key={i}>
							<SelectItem
								key={getVideoOperationId(operation)}
								value={getVideoOperationId(operation)}
							>
								<VideoOperationOption
									currentVideoCodec={currentVideoCodec}
									operation={operation}
								/>
							</SelectItem>
						</SelectGroup>
					);
				})}
			</SelectContent>
		</Select>
	);
};

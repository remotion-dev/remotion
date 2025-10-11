import type {M3uStream} from '@remotion/media-parser';
import React from 'react';
import {M3uAudioStreamSelector} from './M3uAudioStreamSelector';
import {M3uStreamPickerResolutionDisplay} from './M3uStreamPickerResolutionDisplay';
import {Label} from './ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';

export const M3uStreamSelector: React.FC<{
	readonly streams: M3uStream[];
	readonly selectedAssociatedPlaylistId: number | null;
	readonly setSelectedAssociatedPlaylistId: React.Dispatch<
		React.SetStateAction<number | null>
	>;
	readonly selectedId: number | null;
	readonly setSelectedM3uId: React.Dispatch<
		React.SetStateAction<number | null>
	>;
}> = ({
	setSelectedM3uId,
	selectedId,
	selectedAssociatedPlaylistId,
	setSelectedAssociatedPlaylistId,
	streams,
}) => {
	const selectedStream =
		streams.find((stream) => stream.id === selectedId) ?? streams[0];

	return (
		<div className="mb-4">
			<Label htmlFor="quality">Select quality</Label>
			<Select
				value={String(selectedStream.id)}
				onValueChange={(v) => setSelectedM3uId(Number(v))}
			>
				<SelectTrigger id="quality">
					<SelectValue placeholder="Select quality level" />
				</SelectTrigger>
				<SelectContent>
					{streams.map((stream) => {
						return (
							<SelectGroup key={stream.id}>
								<SelectItem value={String(stream.id)}>
									{stream.dimensions ? (
										<M3uStreamPickerResolutionDisplay
											stream={stream}
											allStreams={streams}
										/>
									) : null}
								</SelectItem>
							</SelectGroup>
						);
					})}
				</SelectContent>
			</Select>
			{selectedStream.associatedPlaylists.length > 0 ? (
				<>
					<div className="h-3" />
					<M3uAudioStreamSelector
						selectedAssociatedPlaylistId={selectedAssociatedPlaylistId}
						selectedStream={selectedStream}
						setSelectedAssociatedPlaylistId={setSelectedAssociatedPlaylistId}
					/>
				</>
			) : null}
		</div>
	);
};

import type {M3uStream} from '@remotion/media-parser';
import React from 'react';
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

const PLAYLIST_ID_FOR_NONE = 9999999999;

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
	const selectedAssociatedPlaylist =
		selectedAssociatedPlaylistId ??
		selectedStream?.associatedPlaylists?.find((stream) => stream.default)?.id ??
		null;

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
									{stream.resolution ? (
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

			<div className="h-3" />
			<Label htmlFor="audio">Select audio stream</Label>
			<Select
				value={String(selectedAssociatedPlaylist)}
				onValueChange={(v) => {
					setSelectedAssociatedPlaylistId(Number(v));
				}}
			>
				<SelectTrigger id="audio">
					<SelectValue placeholder="Select audio stream" />
				</SelectTrigger>
				<SelectContent>
					{selectedStream?.associatedPlaylists?.map((stream) => {
						return (
							<SelectGroup key={stream.id}>
								<SelectItem value={String(stream.id)}>
									{stream.name ? <div>{stream.name}</div> : null}
								</SelectItem>
							</SelectGroup>
						);
					})}
					<SelectGroup key={String(PLAYLIST_ID_FOR_NONE)}>
						<SelectItem value={String(PLAYLIST_ID_FOR_NONE)}>None</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
};

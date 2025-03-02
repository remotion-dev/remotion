import type {M3uAssociatedPlaylist} from '@remotion/media-parser';
import {
	defaultSelectM3uAssociatedPlaylists,
	type M3uStream,
} from '@remotion/media-parser';
import React from 'react';
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

export const M3uAudioStreamSelector: React.FC<{
	readonly selectedAssociatedPlaylistId: number | null;
	readonly setSelectedAssociatedPlaylistId: React.Dispatch<
		React.SetStateAction<number | null>
	>;
	readonly selectedStream: M3uStream;
}> = ({
	selectedAssociatedPlaylistId,
	setSelectedAssociatedPlaylistId,
	selectedStream,
}) => {
	const selectedAssociatedPlaylist =
		selectedAssociatedPlaylistId ??
		(
			defaultSelectM3uAssociatedPlaylists({
				associatedPlaylists: selectedStream.associatedPlaylists,
			}) as M3uAssociatedPlaylist[]
		)?.[0]?.id ??
		null;
	return (
		<>
			<Label htmlFor="audio">Select audio stream</Label>
			<Select
				value={String(selectedAssociatedPlaylist ?? PLAYLIST_ID_FOR_NONE)}
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
		</>
	);
};

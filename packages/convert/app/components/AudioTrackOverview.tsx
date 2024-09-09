import type {AudioTrack} from '@remotion/media-parser';
import {Table, TableBody, TableCell, TableRow} from './ui/table';

export const AudioTrackOverview: React.FC<{
	readonly track: AudioTrack;
}> = ({track}) => {
	return (
		<Table>
			<TableBody>
				<TableRow>
					<TableCell colSpan={3}>Type</TableCell>
					<TableCell className="text-right">Audio</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Codec</TableCell>
					<TableCell className="text-right">
						{track.codecWithoutConfig}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>WebCodecs Codec String</TableCell>
					<TableCell className="text-right">{track.codec}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Channels</TableCell>
					<TableCell className="text-right">{track.numberOfChannels}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Sample Rate</TableCell>
					<TableCell className="text-right">{track.sampleRate}</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
};

import type {AudioTrack} from '@remotion/media-parser';
import {renderHumanReadableAudioCodec} from '~/lib/render-codec-label';
import {Table, TableBody, TableCell, TableRow} from './ui/table';

export const AudioTrackOverview: React.FC<{
	readonly track: AudioTrack;
}> = ({track}) => {
	return (
		<Table>
			<TableBody>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						Type
					</TableCell>
					<TableCell className="text-right">Audio</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						Codec
					</TableCell>
					<TableCell className="text-right">
						{renderHumanReadableAudioCodec(track.codecWithoutConfig)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						WebCodecs Codec String
					</TableCell>
					<TableCell className="text-right">{track.codec}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						Channels
					</TableCell>
					<TableCell className="text-right">{track.numberOfChannels}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						Sample Rate
					</TableCell>
					<TableCell className="text-right">{track.sampleRate}</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
};

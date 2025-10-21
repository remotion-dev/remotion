import type {InputAudioTrack} from 'mediabunny';
import {renderHumanReadableAudioCodec} from '~/lib/render-codec-label';
import {Table, TableBody, TableCell, TableRow} from './ui/table';

export const AudioTrackOverview: React.FC<{
	readonly track: InputAudioTrack;
}> = ({track}) => {
	return (
		<Table className="table-fixed">
			<TableBody>
				<TableRow>
					<TableCell className="font-brand">Type</TableCell>
					<TableCell className="text-right">Audio</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Codec</TableCell>
					<TableCell className="text-right">
						{renderHumanReadableAudioCodec(track.codec)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">WebCodecs Codec String</TableCell>
					<TableCell className="text-right">{track.codec}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Channels</TableCell>
					<TableCell className="text-right">{track.numberOfChannels}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Sample Rate</TableCell>
					<TableCell className="text-right">{track.sampleRate}</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
};

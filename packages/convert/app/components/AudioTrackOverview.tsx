import type {
	AudioTrack,
	MediaParserLocation,
	MetadataEntry,
} from '@remotion/media-parser';
import {renderHumanReadableAudioCodec} from '~/lib/render-codec-label';
import {MetadataDisplay} from './MetadataTable';
import {Table, TableBody, TableCell, TableRow} from './ui/table';

export const AudioTrackOverview: React.FC<{
	readonly track: AudioTrack;
	readonly metadata: MetadataEntry[] | null;
	location: MediaParserLocation | null;
}> = ({track, metadata, location}) => {
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
						{renderHumanReadableAudioCodec(track.codecWithoutConfig)}
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
				<MetadataDisplay
					location={location}
					metadata={metadata ?? []}
					trackId={track.trackId}
				/>
			</TableBody>
		</Table>
	);
};

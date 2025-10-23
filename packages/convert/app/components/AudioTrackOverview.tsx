import type {InputAudioTrack} from 'mediabunny';
import {renderHumanReadableAudioCodec} from '~/lib/render-codec-label';
import {PacketList} from './PacketList';
import {TextButtonWithChevron} from './TexrButtonWithChevron';
import {Table, TableBody, TableCell, TableRow} from './ui/table';
import {usePackets} from './use-packets';

export const AudioTrackOverview: React.FC<{
	readonly track: InputAudioTrack;
	readonly showPackets: boolean;
	readonly setShowPackets: (showPackets: boolean) => void;
}> = ({track, showPackets, setShowPackets}) => {
	const packets = usePackets({track});

	if (showPackets) {
		return <PacketList packets={packets} />;
	}

	return (
		<Table className="table-fixed">
			<TableBody>
				<TableRow>
					<TableCell className="font-brand">Type</TableCell>
					<TableCell className="text-right">Audio</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Packets</TableCell>
					<TableCell className="text-right">
						<TextButtonWithChevron onClick={() => setShowPackets(true)}>
							{packets.length}
						</TextButtonWithChevron>
					</TableCell>
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

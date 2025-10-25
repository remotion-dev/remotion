import type {EncodedPacket} from 'mediabunny';
import {Table, TableBody, TableCell, TableHead, TableRow} from './ui/table';

const notMoreThan6DigitsAfterDecimal = (value: number) => {
	return Number.isFinite(value) ? Number(value.toFixed(6)) : '-';
};

export const EncodedPacketRow: React.FC<{
	packet: EncodedPacket;
}> = ({packet}) => {
	return (
		<TableRow>
			<TableCell className="font-brand">{packet.sequenceNumber}</TableCell>
			<TableCell className="font-brand">
				{packet.type === 'key' ? 'Keyframe' : 'Delta'}
			</TableCell>
			<TableCell className="font-brand">{packet.byteLength}</TableCell>
			<TableCell className="font-brand">
				{notMoreThan6DigitsAfterDecimal(packet.timestamp)}
			</TableCell>
			<TableCell className="font-brand">
				{notMoreThan6DigitsAfterDecimal(packet.duration)}
			</TableCell>
		</TableRow>
	);
};

export const PacketList: React.FC<{
	packets: EncodedPacket[];
}> = ({packets}) => {
	return (
		<Table className="relative">
			<TableRow>
				<TableHead className="font-brand">No</TableHead>
				<TableHead className="font-brand">Type</TableHead>
				<TableHead className="font-brand">Size</TableHead>
				<TableHead className="font-brand">Timestamp</TableHead>
				<TableHead className="font-brand">Duration</TableHead>
			</TableRow>
			<TableBody>
				{packets.map((packet) => (
					<EncodedPacketRow key={packet.sequenceNumber} packet={packet} />
				))}
			</TableBody>
		</Table>
	);
};

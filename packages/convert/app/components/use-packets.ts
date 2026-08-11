import type {EncodedPacket} from 'mediabunny';
import {
	EncodedPacketSink,
	type InputAudioTrack,
	type InputVideoTrack,
} from 'mediabunny';
import {useEffect, useMemo, useState} from 'react';

export const usePackets = ({
	track,
}: {
	track: InputVideoTrack | InputAudioTrack;
}) => {
	const [packets, setPackets] = useState<EncodedPacket[]>([]);
	const sink = useMemo(() => new EncodedPacketSink(track), [track]);

	useEffect(() => {
		const iterator = sink.packets(undefined, undefined, {metadataOnly: true});

		let cancelled = false;
		const run = async () => {
			const buffer: EncodedPacket[] = [];
			let count = 0;
			for await (const packet of iterator) {
				buffer.push(packet);
				count++;

				if (count % 1000 === 0) {
					// Only update state every 1000 packets
					setPackets([...buffer]);
				}

				if (cancelled) {
					break;
				}
			}

			// Flush any remaining packets at the end
			setPackets([...buffer]);
		};

		run();

		return () => {
			cancelled = true;
			iterator.return().catch(() => undefined);
		};
	}, [sink]);

	return packets;
};

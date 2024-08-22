import type {MP4File, MP4MediaTrack} from 'mp4box';
import {DataStream} from 'mp4box';

export const getDescription = ({
	mp4File,
	track,
}: {
	mp4File: MP4File;
	track: MP4MediaTrack;
}) => {
	const trak = mp4File.getTrackById(track.id);
	for (const entry of trak.mdia.minf.stbl.stsd.entries) {
		if (entry.avcC || entry.hvcC) {
			const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
			if (entry.avcC) {
				entry.avcC.write(stream);
			} else if (entry.hvcC) {
				entry.hvcC.write(stream);
			}

			return new Uint8Array(stream.buffer, 8); // Remove the box header.
		}
	}
};

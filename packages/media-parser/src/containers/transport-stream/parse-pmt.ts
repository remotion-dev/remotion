import type {BufferIterator} from '../../buffer-iterator';
import type {TransportStreamPMTBox} from './boxes';
import {discardRestOfPacket} from './discard-rest-of-packet';

export type TransportStreamEntry = {
	streamType: number;
	pid: number;
};

export type TransportStreamProgramMapTable = {
	type: 'transport-stream-program-map-table';
	streams: TransportStreamEntry[];
};

const parsePmtTable = ({
	iterator,
	tableId,
	sectionLength,
}: {
	iterator: BufferIterator;
	tableId: number;
	sectionLength: number;
}): TransportStreamPMTBox => {
	const start = iterator.counter.getOffset();
	iterator.getUint16(); // table ID extension
	iterator.startReadingBits();
	iterator.getBits(7); // reserved
	iterator.getBits(1); // current / next indicator;
	const sectionNumber = iterator.getBits(8);
	const lastSectionNumber = iterator.getBits(8);

	const tables: TransportStreamProgramMapTable[] = [];

	for (let i = sectionNumber; i <= lastSectionNumber; i++) {
		iterator.getBits(3); // reserved
		iterator.getBits(13); // PCR PID
		iterator.getBits(4); // reserved
		const programInfoLength = iterator.getBits(12);

		const streams: TransportStreamEntry[] = [];
		while (true) {
			const streamType = iterator.getBits(8);
			iterator.getBits(3); // reserved
			const elementaryPid = iterator.getBits(13);
			iterator.getBits(4); // reserved
			const esInfoLength = iterator.getBits(12);
			iterator.getBits(esInfoLength * 8);
			streams.push({streamType, pid: elementaryPid});
			iterator.getBits(programInfoLength * 8); // program descriptor

			const remaining = sectionLength - (iterator.counter.getOffset() - start);
			if (remaining <= 4) {
				break;
			}
		}

		tables.push({
			type: 'transport-stream-program-map-table',
			streams,
		});
	}

	if (tables.length !== 1) {
		throw new Error('Does not PMT table with more than 1 entry, uncommon');
	}

	iterator.stopReadingBits();

	return {
		type: 'transport-stream-pmt-box',
		tableId,
		streams: tables[0].streams,
	};
};

export const parsePmt = (iterator: BufferIterator): TransportStreamPMTBox => {
	iterator.startReadingBits();

	const tableId = iterator.getBits(8);
	iterator.getBits(1); // syntax indicator
	iterator.getBits(1); // private bit
	iterator.getBits(4);
	const sectionLength = iterator.getBits(10);
	if (sectionLength > 1021) {
		throw new Error('Invalid section length');
	}

	iterator.stopReadingBits();

	const tables = parsePmtTable({iterator, tableId, sectionLength});
	discardRestOfPacket(iterator);
	return tables;
};

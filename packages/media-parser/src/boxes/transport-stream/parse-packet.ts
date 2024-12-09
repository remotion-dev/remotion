import type {BufferIterator} from '../../buffer-iterator';
import type {TransportStreamStructure} from '../../parse-result';
import type {
	TransportStreamAdaptationField,
	TransportStreamBox,
	TransportStreamHeader,
} from './boxes';
import {discardRestOfPacket} from './discard-rest-of-packet';
import {parsePat} from './parse-pat';
import {parsePmt} from './parse-pmt';
import {getProgramForId, getStreamForId} from './traversal';

export const parsePacket = (
	iterator: BufferIterator,
	structure: TransportStreamStructure,
): Promise<TransportStreamBox> => {
	const syncByte = iterator.getUint8();
	if (syncByte !== 0x47) {
		throw new Error('Invalid sync byte');
	}

	iterator.startReadingBits();
	const transportErrorIndicator = iterator.getBits(1);
	const payloadUnitStartIndicator = iterator.getBits(1);
	const transportPriority = iterator.getBits(1);
	const packetIdentifier = iterator.getBits(13);
	const transportScramblingControl = iterator.getBits(2);
	const adaptationFieldControl1 = iterator.getBits(1);
	const adaptationFieldControl2 = iterator.getBits(1);
	const continuityCounter = iterator.getBits(4);
	iterator.stopReadingBits();
	let adaptationField: TransportStreamAdaptationField | null = null;
	if (adaptationFieldControl1 === 1) {
		iterator.startReadingBits();
		const adaptationFieldLength = iterator.getBits(8);
		const offset = iterator.counter.getOffset();
		const discontinuityIndicator = iterator.getBits(1);
		const randomAccessIndicator = iterator.getBits(1);
		const elementaryStreamPriorityIndicator = iterator.getBits(1);
		const pcrFlag = iterator.getBits(1);
		const opcrFlag = iterator.getBits(1);
		const splicingPointFlag = iterator.getBits(1);
		const transportPrivateDataFlag = iterator.getBits(1);
		const adaptationFieldExtensionFlag = iterator.getBits(1);
		adaptationField = {
			adaptationFieldExtensionFlag,
			adaptationFieldLength,
			discontinuityIndicator,
			elementaryStreamPriorityIndicator,
			opcrFlag,
			pcrFlag,
			randomAccessIndicator,
			splicingPointFlag,
			transportPrivateDataFlag,
		};
		const remaining =
			adaptationFieldLength - (iterator.counter.getOffset() - offset);
		iterator.stopReadingBits();
		iterator.discard(Math.max(0, remaining));
	}

	let pointerField: number | null = null;

	if (payloadUnitStartIndicator === 1) {
		pointerField = iterator.getUint8();
	}

	const header: TransportStreamHeader = {
		packetIdentifier,
		syncByte,
		adaptationFieldControl1,
		adaptationFieldControl2,
		continuityCounter,
		payloadUnitStartIndicator,
		transportErrorIndicator,
		transportPriority,
		transportScramblingControl,
		adaptionField: adaptationField,
		pointerField,
	};

	if (packetIdentifier === 0) {
		return Promise.resolve(parsePat(iterator));
	}

	const program = getProgramForId(structure, packetIdentifier);
	if (program) {
		const pmt = parsePmt(iterator);
		return Promise.resolve(pmt);
	}

	const stream = getStreamForId(structure, packetIdentifier);
	if (!stream) {
		throw new Error('Unknown packet identifier');
	}

	discardRestOfPacket(iterator);

	return Promise.resolve({
		type: 'transport-stream-generic-box',
		header,
	});
};

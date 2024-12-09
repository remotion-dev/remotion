import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult, TransportStreamStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import type {
	TransportStreamAdaptationField,
	TransportStreamBox,
	TransportStreamHeader,
} from './boxes';

export const parseTransportStream = ({
	iterator,
	parsercontext,
}: {
	iterator: BufferIterator;
	parsercontext: ParserContext;
}): Promise<ParseResult<TransportStreamStructure>> => {
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
			type: 'transport-stream-adaptation-field',
		};
		const remaining =
			adaptationFieldLength - (iterator.counter.getOffset() - offset);
		iterator.stopReadingBits();
		iterator.discard(remaining);
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
		type: 'transport-stream-header',
		adaptionField: adaptationField,
	};

	const segments: TransportStreamBox[] = [header];

	parsercontext.parserState.tracks.setIsDone();

	return Promise.resolve({
		segments: {
			type: 'transport-stream',
			boxes: segments,
		},
		status: 'done',
	});
};

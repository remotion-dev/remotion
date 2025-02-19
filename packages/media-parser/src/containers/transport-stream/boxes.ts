import type {TransportStreamProgramAssociationTableEntry} from './parse-pat';
import type {TransportStreamEntry} from './parse-pmt';

export type TransportStreamAdaptationField = {
	adaptationFieldLength: number;
	discontinuityIndicator: number;
	randomAccessIndicator: number;
	elementaryStreamPriorityIndicator: number;
	pcrFlag: number;
	opcrFlag: number;
	splicingPointFlag: number;
	transportPrivateDataFlag: number;
	adaptationFieldExtensionFlag: number;
};

export type TransportStreamHeader = {
	syncByte: number;
	transportErrorIndicator: number;
	payloadUnitStartIndicator: number;
	transportPriority: number;
	packetIdentifier: number;
	transportScramblingControl: number;
	adaptationFieldControl1: number;
	adaptationFieldControl2: number;
	continuityCounter: number;
	adaptionField: TransportStreamAdaptationField | null;
	pointerField: number | null;
};

export type TransportStreamGenericBox = {
	header: TransportStreamHeader;
	type: 'transport-stream-generic-box';
};

export type TransportStreamPATBox = {
	type: 'transport-stream-pat-box';
	tableId: string;
	pat: TransportStreamProgramAssociationTableEntry[];
};

export type TransportStreamSdtBox = {
	type: 'transport-stream-sdt-box';
};

export type TransportStreamPMTBox = {
	type: 'transport-stream-pmt-box';
	tableId: number;
	streams: TransportStreamEntry[];
};

export type TransportStreamBox =
	| TransportStreamGenericBox
	| TransportStreamPATBox
	| TransportStreamSdtBox
	| TransportStreamPMTBox;

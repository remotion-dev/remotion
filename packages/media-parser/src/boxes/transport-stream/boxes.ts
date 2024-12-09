export type TransportStreamAdaptationField = {
	type: 'transport-stream-adaptation-field';
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
	type: 'transport-stream-header';
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
};

export type TransportStreamBox = TransportStreamHeader;

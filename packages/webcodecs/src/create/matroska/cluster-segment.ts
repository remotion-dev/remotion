import {
	combineUint8Arrays,
	getVariableInt,
	makeMatroskaBytes,
	matroskaToHex,
	serializeUint16,
} from './matroska-utils';

export const CLUSTER_MIN_VINT_WIDTH = 8;

export const createClusterSegment = (timestamp: number) => {
	return makeMatroskaBytes({
		type: 'Cluster',
		value: [
			{
				type: 'Timestamp',
				minVintWidth: null,
				value: {
					value: timestamp,
					byteLength: null,
				},
			},
		],
		minVintWidth: CLUSTER_MIN_VINT_WIDTH,
	});
};

export const makeSimpleBlock = ({
	bytes,
	trackNumber,
	timecodeRelativeToCluster,
	keyframe,
	invisible,
	lacing,
}: {
	bytes: Uint8Array;
	trackNumber: number;
	timecodeRelativeToCluster: number;
	keyframe: boolean;
	invisible: boolean;
	lacing: number;
}) => {
	const simpleBlockHeader = matroskaToHex('0xa3');

	const headerByte =
		(Number(keyframe) << 7) | (Number(invisible) << 3) | (lacing << 1);

	const body = combineUint8Arrays([
		getVariableInt(trackNumber, null),
		serializeUint16(timecodeRelativeToCluster),
		new Uint8Array([headerByte]),
		bytes,
	]);

	return combineUint8Arrays([
		simpleBlockHeader,
		getVariableInt(body.length, null),
		body,
	]);
};

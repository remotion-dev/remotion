import {getVariableInt} from '../boxes/webm/ebml';
import {
	combineUint8Arrays,
	makeMatroskaBytes,
	matroskaToHex,
	serializeUint16,
} from '../boxes/webm/make-header';

export const createClusterSegment = () => {
	return makeMatroskaBytes({
		type: 'Cluster',
		value: [
			{
				type: 'Timestamp',
				minVintWidth: 4,
				value: {
					value: 0,
					byteLength: null,
				},
			},
		],
		minVintWidth: 8,
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

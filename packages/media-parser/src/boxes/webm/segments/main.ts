import {type MatroskaSegment} from '../segments';

export type MainSegment = {
	type: 'main-segment';
	children: MatroskaSegment[];
};

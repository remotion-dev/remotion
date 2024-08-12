import type {BufferIterator} from '../../../../buffer-iterator';
import {uvlc} from './uvlc';

export type TimingInfo = {
	num_units_in_display_tick: number;
	time_scale: number;
	equal_picture_interval: boolean;
	num_ticks_per_picture_minus_1: number;
};

export const getTimingInfo = (stream: BufferIterator): TimingInfo => {
	const num_units_in_display_tick = stream.getBits(32);
	const time_scale = stream.getBits(32);
	const equal_picture_interval = Boolean(stream.getBits(1));

	let num_ticks_per_picture_minus_1 = 0;

	if (equal_picture_interval) {
		num_ticks_per_picture_minus_1 = uvlc(stream);
	}

	return {
		num_units_in_display_tick,
		time_scale,
		equal_picture_interval,
		num_ticks_per_picture_minus_1,
	};
};

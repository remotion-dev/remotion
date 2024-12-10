import type {BufferIterator} from '../../buffer-iterator';
import type {UnimplementedBox} from './boxes';
import {discardRestOfPacket} from './discard-rest-of-packet';

export const doesPesPacketFollow = (iterator: BufferIterator) => {
	const assertion = iterator.getUint24() === 0x000001;
	iterator.counter.decrement(3);
	return assertion;
};

export const parseStream = (iterator: BufferIterator): UnimplementedBox => {
	discardRestOfPacket(iterator);
	return {type: 'transport-stream-unimplemented-box'};
};

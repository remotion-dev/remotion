import type {BufferIterator} from '../../../buffer-iterator';

type AudioObjectType = 'aac' | 'mp3' | 'unknown';

type DecoderConfigDescriptor = {
	type: 'decoder-config-descriptor';
	objectTypeIndication: AudioObjectType;
	asNumber: number;
};

const mapToObjectAudioIndicator = (num: number): AudioObjectType => {
	// https://chromium.googlesource.com/chromium/src/media/+/master/formats/mp4/es_descriptor.h
	// http://netmedia.zju.edu.cn/multimedia2013/mpeg-4/ISO%20IEC%2014496-1%20MPEG-4%20System%20Standard.pdf
	// Page 42, table 8
	if (num === 0x40) {
		return 'aac';
	}

	if (num === 0x6b) {
		return 'mp3';
	}

	return 'unknown';
};

type SlConfigDescriptor = {
	type: 'sl-config-descriptor';
};

type UnknownDescriptor = {
	type: 'unknown-descriptor';
};

export type Descriptor =
	| DecoderConfigDescriptor
	| SlConfigDescriptor
	| UnknownDescriptor;

type DescriptorAndNext = {
	descriptor: Descriptor | null;
};

export const processDescriptor = ({
	iterator,
}: {
	iterator: BufferIterator;
}): DescriptorAndNext => {
	const tag = iterator.getUint8();

	if (tag === 4) {
		const size = iterator.getPaddedFourByteNumber();
		const initialOffset = iterator.counter.getOffset();

		const objectTypeIndication = iterator.getUint8();

		const remaining = size - (iterator.counter.getOffset() - initialOffset);
		iterator.discard(remaining);
		return {
			descriptor: {
				type: 'decoder-config-descriptor',
				objectTypeIndication: mapToObjectAudioIndicator(objectTypeIndication),
				asNumber: objectTypeIndication,
			},
		};
	}

	if (tag === 6) {
		const size = iterator.getPaddedFourByteNumber();

		iterator.discard(size);
		return {
			descriptor: {
				type: 'sl-config-descriptor',
			},
		};
	}

	return {
		descriptor: null,
	};
};

export const parseDescriptors = (
	iterator: BufferIterator,
	maxBytes: number,
): Descriptor[] => {
	const descriptors: Descriptor[] = [];
	const initialOffset = iterator.counter.getOffset();

	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() - initialOffset < maxBytes
	) {
		const {descriptor} = processDescriptor({
			iterator,
		});

		if (descriptor) {
			descriptors.push(descriptor);
		} else {
			break;
		}
	}

	return descriptors;
};

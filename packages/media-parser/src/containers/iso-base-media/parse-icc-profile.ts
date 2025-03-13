import {getArrayBufferIterator} from '../../buffer-iterator';

type Point = {
	x: number;
	y: number;
	z: number;
};

export type IccProfile = {
	size: number;
	preferredCMMType: string;
	profileVersion: string;
	profileDeviceClass: string;
	colorSpace: string;
	pcs: string;
	dateTime: Uint8Array;
	signature: string;
	primaryPlatform: string;
	profileFlags: number;
	deviceManufacturer: string;
	deviceModel: string;
	deviceAttributes: bigint;
	renderingIntent: number;
	pcsIlluminant: [number, number, number];
	profileCreator: string;
	profileId: string;
	entries: Entry[];
	rXYZ: Point | null;
	gXYZ: Point | null;
	bXYZ: Point | null;
	whitePoint: Point | null;
};

type Entry = {
	tag: string;
	size: number;
	offset: number;
};

export const parseIccProfile = (data: Uint8Array): IccProfile => {
	const iterator = getArrayBufferIterator(data, Infinity);
	const size = iterator.getUint32();
	if (size !== data.length) {
		throw new Error('Invalid ICC profile size');
	}

	const preferredCMMType = iterator.getByteString(4, false);
	const profileVersion = iterator.getByteString(4, false);
	const profileDeviceClass = iterator.getByteString(4, false);
	const colorSpace = iterator.getByteString(4, false);
	const pcs = iterator.getByteString(4, false);
	const dateTime = iterator.getSlice(12);
	const signature = iterator.getByteString(4, false);
	if (signature !== 'acsp') {
		throw new Error('Invalid ICC profile signature');
	}

	const primaryPlatform = iterator.getByteString(4, false);
	const profileFlags = iterator.getUint32();
	const deviceManufacturer = iterator.getByteString(4, false);
	const deviceModel = iterator.getByteString(4, false);
	const deviceAttributes = iterator.getUint64();
	const renderingIntent = iterator.getUint32();
	const pcsIlluminant1 = iterator.getUint32();
	const pcsIlluminant2 = iterator.getUint32();
	const pcsIlluminant3 = iterator.getUint32();
	const profileCreator = iterator.getByteString(4, false);
	const profileId = iterator.getByteString(16, false);

	// reserved
	iterator.discard(28);

	const tagCount = iterator.getUint32();
	const entries: Entry[] = [];
	for (let i = 0; i < tagCount; i++) {
		const entry: Entry = {
			tag: iterator.getByteString(4, false),
			offset: iterator.getUint32(),
			size: iterator.getUint32(),
		};
		entries.push(entry);
	}

	let lastOffset = -1;

	let rXYZ: Point | null = null;
	let gXYZ: Point | null = null;
	let bXYZ: Point | null = null;
	let whitePoint: Point | null = null;

	for (const entry of entries) {
		const found = data.slice(entry.offset, entry.offset + entry.size);
		if (
			entry.tag === 'rXYZ' ||
			entry.tag === 'gXYZ' ||
			entry.tag === 'bXYZ' ||
			entry.tag === 'wtpt'
		) {
			const it = getArrayBufferIterator(found, Infinity);
			it.discard(4);

			const x = it.getInt32() / 65536;
			const y = it.getInt32() / 65536;
			const z = it.getInt32() / 65536;
			it.destroy();
			const point = {x, y, z};
			if (entry.tag === 'rXYZ') {
				rXYZ = point;
			} else if (entry.tag === 'gXYZ') {
				gXYZ = point;
			} else if (entry.tag === 'bXYZ') {
				bXYZ = point;
			} else if (entry.tag === 'wtpt') {
				whitePoint = point;
			}
		}

		if (lastOffset !== -1) {
			const bytesToAdvance = entry.offset - lastOffset;
			const bytesToGoBackwards = entry.size - bytesToAdvance;
			if (bytesToGoBackwards > 0) {
				iterator.counter.decrement(bytesToGoBackwards);
			}
		}

		lastOffset = entry.offset;
	}

	const profile: IccProfile = {
		size,
		preferredCMMType,
		profileVersion,
		profileDeviceClass,
		colorSpace,
		pcs,
		dateTime,
		signature,
		primaryPlatform,
		profileFlags,
		deviceManufacturer,
		deviceModel,
		deviceAttributes,
		renderingIntent,
		pcsIlluminant: [
			pcsIlluminant1 / 65536,
			pcsIlluminant2 / 65536,
			pcsIlluminant3 / 65536,
		],
		profileCreator,
		profileId,
		entries,
		bXYZ,
		gXYZ,
		rXYZ,
		whitePoint,
	};

	iterator.destroy();

	return profile;
};

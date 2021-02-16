function mulberry32(a: number) {
	let t = a + 0x6d2b79f5;
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function hashCode(str: string) {
	let i = 0;
	let chr = 0;
	let hash = 0;

	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

export const random = (input: number | string | null, dummy?: unknown) => {
	if (dummy !== undefined) {
		throw new TypeError('random() takes only one argument');
	}
	if (input === null) {
		return Math.random();
	}
	if (typeof input === 'string') {
		return mulberry32(hashCode(input));
	}
	if (typeof input === 'number') {
		return mulberry32(input * 10000000000);
	}
	throw new Error('random() argument must be a number or a string');
};

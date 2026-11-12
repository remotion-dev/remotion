export type FontRaster = {
	width: number;
	height: number;
	metrics: readonly number[];
	pixels: Uint8ClampedArray<ArrayBufferLike>;
};
export type FontFingerprintKey = readonly (string | number | null)[];
type CandidateRasters = readonly (readonly FontRaster[])[];
type Entry = {
	key: FontFingerprintKey;
	candidates: CandidateRasters;
	bytes: number;
};

export const equalFontFingerprintKeys = (
	a: FontFingerprintKey,
	b: FontFingerprintKey,
) => a.length === b.length && a.every((value, index) => value === b[index]);

class FontFingerprintCache {
	private readonly identities = new WeakMap<object, number>();
	private nextIdentity = 0;
	private entries: Entry[] = [];
	private bytes = 0;
	epoch = 0;

	constructor(document: Document) {
		const invalidate = () => {
			this.epoch++;
			this.entries = [];
			this.bytes = 0;
		};

		for (const event of ['loading', 'loadingdone', 'loadingerror'])
			document.fonts.addEventListener(event, invalidate);
	}

	identity(object: object) {
		let id = this.identities.get(object);
		if (id === undefined) {
			id = ++this.nextIdentity;
			this.identities.set(object, id);
		}

		return id;
	}

	get(key: FontFingerprintKey) {
		const index = this.entries.findIndex((candidate) =>
			equalFontFingerprintKeys(candidate.key, key),
		);
		if (index === -1) return null;
		const [entry] = this.entries.splice(index, 1);
		this.entries.push(entry!);
		return entry!.candidates;
	}

	delete(key: FontFingerprintKey) {
		const index = this.entries.findIndex((entry) =>
			equalFontFingerprintKeys(entry.key, key),
		);
		if (index !== -1) {
			this.bytes -= this.entries[index]!.bytes;
			this.entries.splice(index, 1);
		}
	}

	put(key: FontFingerprintKey, candidates: CandidateRasters) {
		// Count retained rule/sample strings as well as raster payloads. The entry
		// count also bounds object overhead; oversized inputs keep the cold path.
		const bytes =
			key.reduce<number>(
				(sum, value) =>
					sum + (typeof value === 'string' ? value.length * 2 : 8),
				0,
			) +
			candidates.reduce(
				(sum, group) =>
					sum +
					group.reduce(
						(groupSum, raster) =>
							groupSum +
							raster.pixels.byteLength +
							raster.metrics.length * 8 +
							16,
						0,
					),
				0,
			);
		if (bytes > 32 * 1024 * 1024) return;
		this.delete(key);
		while (
			this.entries.length &&
			(this.entries.length >= 16 || this.bytes + bytes > 32 * 1024 * 1024)
		) {
			this.bytes -= this.entries.shift()!.bytes;
		}

		this.entries.push({key: [...key], candidates, bytes});
		this.bytes += bytes;
	}
}

const caches = new WeakMap<Document, FontFingerprintCache>();
export const getFontFingerprintCache = (document: Document) => {
	let cache = caches.get(document);
	if (!cache) {
		cache = new FontFingerprintCache(document);
		caches.set(document, cache);
	}

	return cache;
};

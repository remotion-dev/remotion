import type {WaveformResult} from '../audio-waveform/load-waveform-peaks';
import {getWaveformMaxima} from '../audio-waveform/waveform-maxima';
import {
	addFrameToCache,
	aspectRatioCache,
	frameDatabase,
	makeFrameDatabaseKey,
	mediaDurationCache,
} from '../frame-database';
import {getFrameDistance, getSlotTolerance} from '../render-frame-strip';
import {
	dequantizeWaveformPeaks,
	quantizeWaveformPeaks,
} from './quantize-waveform-peaks';

// Bump when the stored data or the way it is computed changes.
// Opening the database with a newer version wipes all stores.
const SCHEMA_VERSION = 1;
const DATABASE_NAME = 'remotion-timeline-cache';
const MAX_TOTAL_BYTES = 256 * 1024 * 1024;
const EVICT_TO_BYTES = 200 * 1024 * 1024;
const MAX_THUMBNAIL_BYTES_PER_SOURCE = 16 * 1024 * 1024;
const MAX_UNUSED_AGE_MS = 30 * 24 * 60 * 60 * 1000;
// Remote sources without ETag or Last-Modified cannot be revalidated.
const MAX_AGE_WITHOUT_VALIDATOR_MS = 7 * 24 * 60 * 60 * 1000;
const THUMBNAIL_FLUSH_DELAY_MS = 1000;
const EVICTION_DELAY_MS = 5000;

type SourceRecord = {
	readonly src: string;
	readonly fingerprint: string;
	readonly createdAt: number;
	readonly lastAccessedAt: number;
	readonly aspectRatio: number | null;
	readonly durationInSeconds: number | null;
	// Owned by the caller, for example the Studio's media metadata.
	readonly mediaMetadata: unknown;
	readonly waveformBytes: number;
	readonly thumbnailBytes: number;
};

type WaveformRecord = {
	readonly src: string;
	readonly waveformSampleRate: number;
	readonly peaks: Uint8Array;
	readonly averageVolume: number | null;
};

type ThumbnailRecord = {
	readonly src: string;
	readonly height: number;
	readonly timestamp: number;
	readonly duration: number | null;
	readonly createdAt: number;
	readonly image: Blob;
};

type PendingThumbnail = {
	readonly src: string;
	readonly aspectRatio: number | null;
	readonly durationInSeconds: number | null;
	readonly height: number;
	readonly timestamp: number;
	readonly duration: number | null;
	readonly image: Promise<Blob>;
};

const ALL_STORES = ['sources', 'waveforms', 'thumbnails'];

let databasePromise: Promise<IDBDatabase | null> | null = null;
const UNVALIDATED = 'unvalidated';

const remoteFingerprints = new Map<string, Promise<string | null>>();
const readableSources = new Map<string, Promise<IDBDatabase | null>>();
const writableSources = new Map<string, Promise<IDBDatabase | null>>();
let pendingThumbnails: PendingThumbnail[] = [];
let thumbnailFlushTimeout: ReturnType<typeof setTimeout> | null = null;
let evictionTimeout: ReturnType<typeof setTimeout> | null = null;

const toPromise = <T>(request: IDBRequest<T>) => {
	return new Promise<T>((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
};

const transactionDone = (transaction: IDBTransaction) => {
	return new Promise<void>((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
};

// Sorts after every [src, ...] key, since arrays sort after numbers.
const getSourceKeyRange = (src: string) => IDBKeyRange.bound([src], [src, []]);

const deleteSourceData = (transaction: IDBTransaction, src: string) => {
	transaction.objectStore('sources').delete(src);
	transaction.objectStore('waveforms').delete(getSourceKeyRange(src));
	transaction.objectStore('thumbnails').delete(getSourceKeyRange(src));
};

const openDatabase = (): Promise<IDBDatabase | null> => {
	if (databasePromise) {
		return databasePromise;
	}

	databasePromise = new Promise((resolve) => {
		if (typeof indexedDB === 'undefined') {
			resolve(null);
			return;
		}

		const request = indexedDB.open(DATABASE_NAME, SCHEMA_VERSION);
		request.onupgradeneeded = () => {
			const database = request.result;
			for (const name of Array.from(database.objectStoreNames)) {
				database.deleteObjectStore(name);
			}

			database.createObjectStore('sources', {keyPath: 'src'});
			database.createObjectStore('waveforms', {
				keyPath: ['src', 'waveformSampleRate'],
			});
			database
				.createObjectStore('thumbnails', {
					keyPath: ['src', 'height', 'timestamp'],
				})
				.createIndex('createdAt', ['src', 'createdAt']);
		};

		request.onsuccess = () => {
			const database = request.result;
			// Let a tab with a newer schema version upgrade the database.
			database.onversionchange = () => {
				database.close();
				databasePromise = null;
				readableSources.clear();
				writableSources.clear();
			};

			resolve(database);
		};

		request.onerror = () => resolve(null);
	});

	return databasePromise;
};

// The Studio knows size and modification time of public folder files, so
// they can be validated without a request.
const getStaticFileFingerprint = (src: string): string | null => {
	const staticFile =
		typeof window === 'undefined'
			? undefined
			: window.remotion_staticFiles?.find((file) => file.src === src);

	return staticFile
		? `static:${staticFile.sizeInBytes}:${staticFile.lastModified}`
		: null;
};

const getRemoteFingerprint = (src: string): Promise<string | null> => {
	const existing = remoteFingerprints.get(src);
	if (existing) {
		return existing;
	}

	// A ranged GET instead of HEAD, because presigned URLs are only signed for GET.
	const promise = fetch(src, {headers: {Range: 'bytes=0-0'}, cache: 'no-store'})
		.then((response) => {
			response.body?.cancel().catch(() => undefined);
			if (!response.ok) {
				return null;
			}

			const etag = response.headers.get('etag');
			const lastModified = response.headers.get('last-modified');
			if (etag === null && lastModified === null) {
				return UNVALIDATED;
			}

			return `remote:${etag}:${lastModified}`;
		})
		.catch(() => null);
	remoteFingerprints.set(src, promise);
	return promise;
};

const isCacheable = (src: string) => {
	return !src.startsWith('blob:') && !src.startsWith('data:');
};

// 'budget' keeps the cache below its size limit, 'halve' makes room after
// the browser rejected a write because the origin ran out of quota.
const evict = async (mode: 'budget' | 'halve') => {
	const database = await openDatabase();
	if (!database) {
		return;
	}

	const sources: SourceRecord[] = await toPromise(
		database.transaction('sources').objectStore('sources').getAll(),
	);

	// Long videos scrolled at a deep zoom level can produce a lot of
	// thumbnails. Drop the oldest ones of a source first.
	for (const {src, thumbnailBytes} of sources) {
		if (thumbnailBytes <= MAX_THUMBNAIL_BYTES_PER_SOURCE) {
			continue;
		}

		const trimTransaction = database.transaction(
			['sources', 'thumbnails'],
			'readwrite',
		);
		const source: SourceRecord | undefined = await toPromise(
			trimTransaction.objectStore('sources').get(src),
		);
		if (!source) {
			continue;
		}

		let bytes = source.thumbnailBytes;
		await new Promise<void>((resolve, reject) => {
			const request = trimTransaction
				.objectStore('thumbnails')
				.index('createdAt')
				.openCursor(getSourceKeyRange(src));
			request.onsuccess = () => {
				const cursor = request.result;
				if (!cursor || bytes <= MAX_THUMBNAIL_BYTES_PER_SOURCE * 0.75) {
					resolve();
					return;
				}

				bytes -= (cursor.value as ThumbnailRecord).image.size;
				cursor.delete();
				cursor.continue();
			};

			request.onerror = () => reject(request.error);
		});
		trimTransaction
			.objectStore('sources')
			.put({...source, thumbnailBytes: bytes} satisfies SourceRecord);
		await transactionDone(trimTransaction);
	}

	const transaction = database.transaction(ALL_STORES, 'readwrite');
	const current: SourceRecord[] = await toPromise(
		transaction.objectStore('sources').getAll(),
	);
	let totalBytes = current.reduce(
		(sum, source) => sum + source.waveformBytes + source.thumbnailBytes,
		0,
	);
	const targetBytes =
		mode === 'halve'
			? totalBytes / 2
			: totalBytes > MAX_TOTAL_BYTES
				? EVICT_TO_BYTES
				: Infinity;
	const now = Date.now();
	const leastRecentlyUsedFirst = current.sort(
		(a, b) => a.lastAccessedAt - b.lastAccessedAt,
	);
	for (const source of leastRecentlyUsedFirst) {
		if (
			totalBytes <= targetBytes &&
			now - source.lastAccessedAt <= MAX_UNUSED_AGE_MS
		) {
			break;
		}

		totalBytes -= source.waveformBytes + source.thumbnailBytes;
		deleteSourceData(transaction, source.src);
	}

	await transactionDone(transaction);
};

const scheduleEviction = () => {
	if (evictionTimeout !== null) {
		return;
	}

	evictionTimeout = setTimeout(() => {
		evictionTimeout = null;
		const run = () => evict('budget').catch(() => undefined);
		// Tabs share the database, one eviction pass at a time is enough.
		if (typeof navigator !== 'undefined' && navigator.locks) {
			navigator.locks
				.request(
					'remotion-timeline-cache-eviction',
					{ifAvailable: true},
					(lock) => (lock ? run() : undefined),
				)
				.catch(() => undefined);
			return;
		}

		run();
	}, EVICTION_DELAY_MS);
};

// Resolves to the database if `src` has cached data that may be read.
// Remote sources are not validated before reading: on a slow connection, the
// request would wait behind the media downloads and delay drawing. They are
// validated in the background instead, and purged if they changed, so that
// the next page load recomputes them.
const getReadableDatabase = (src: string): Promise<IDBDatabase | null> => {
	if (!isCacheable(src)) {
		return Promise.resolve(null);
	}

	const staticFingerprint = getStaticFileFingerprint(src);
	const key = `${staticFingerprint ?? 'remote'}|${src}`;
	const existing = readableSources.get(key);
	if (existing) {
		return existing;
	}

	const promise = (async () => {
		const database = await openDatabase();
		if (!database) {
			return null;
		}

		const transaction = database.transaction(ALL_STORES, 'readwrite');
		const sources = transaction.objectStore('sources');
		const source: SourceRecord | undefined = await toPromise(sources.get(src));
		if (!source) {
			return null;
		}

		const now = Date.now();
		const usable =
			staticFingerprint === null
				? source.fingerprint !== UNVALIDATED ||
					now - source.createdAt <= MAX_AGE_WITHOUT_VALIDATOR_MS
				: source.fingerprint === staticFingerprint;
		if (!usable) {
			deleteSourceData(transaction, src);
			await transactionDone(transaction);
			return null;
		}

		sources.put({...source, lastAccessedAt: now} satisfies SourceRecord);
		await transactionDone(transaction);

		if (source.aspectRatio !== null && !aspectRatioCache.has(src)) {
			aspectRatioCache.set(src, source.aspectRatio);
		}

		if (source.durationInSeconds !== null && !mediaDurationCache.has(src)) {
			mediaDurationCache.set(src, source.durationInSeconds);
		}

		if (staticFingerprint === null) {
			getRemoteFingerprint(src)
				.then((fingerprint) => {
					if (fingerprint === null || fingerprint === source.fingerprint) {
						return;
					}

					const purge = database.transaction(ALL_STORES, 'readwrite');
					deleteSourceData(purge, src);
					return transactionDone(purge);
				})
				.catch(() => undefined);
		}

		scheduleEviction();
		return database;
	})().catch(() => null);
	readableSources.set(key, promise);
	return promise;
};

// Resolves to the database once `src` has a record that new data can be
// added to. Creating one requires the fingerprint of the source.
const getWritableDatabase = (src: string): Promise<IDBDatabase | null> => {
	if (!isCacheable(src)) {
		return Promise.resolve(null);
	}

	const staticFingerprint = getStaticFileFingerprint(src);
	const key = `${staticFingerprint ?? 'remote'}|${src}`;
	const existing = writableSources.get(key);
	if (existing) {
		return existing;
	}

	const promise = (async () => {
		// Avoid the fingerprint request if there is no database to use it with.
		const database = await openDatabase();
		if (!database) {
			return null;
		}

		// Also purges data of a source that has changed.
		if (await getReadableDatabase(src)) {
			return database;
		}

		const fingerprint = staticFingerprint ?? (await getRemoteFingerprint(src));
		if (fingerprint === null) {
			return null;
		}

		const transaction = database.transaction(ALL_STORES, 'readwrite');
		const sources = transaction.objectStore('sources');
		const current: SourceRecord | undefined = await toPromise(sources.get(src));
		if (current?.fingerprint !== fingerprint) {
			deleteSourceData(transaction, src);
			const now = Date.now();
			sources.put({
				src,
				fingerprint,
				createdAt: now,
				lastAccessedAt: now,
				aspectRatio: null,
				durationInSeconds: null,
				mediaMetadata: null,
				waveformBytes: 0,
				thumbnailBytes: 0,
			} satisfies SourceRecord);
		}

		await transactionDone(transaction);
		scheduleEviction();
		return database;
	})().catch(() => null);
	writableSources.set(key, promise);
	return promise;
};

const onWriteError = (error: unknown) => {
	if (error instanceof DOMException && error.name === 'QuotaExceededError') {
		evict('halve').catch(() => undefined);
	}
};

// Lets the timeline draw a media clip before its metadata is fetched again.
export const readMediaMetadataFromPersistentCache = async (
	src: string,
): Promise<unknown> => {
	try {
		const database = await getReadableDatabase(src);
		if (!database) {
			return null;
		}

		const source: SourceRecord | undefined = await toPromise(
			database.transaction('sources').objectStore('sources').get(src),
		);
		return source?.mediaMetadata ?? null;
	} catch {
		return null;
	}
};

export const writeMediaMetadataToPersistentCache = ({
	src,
	mediaMetadata,
}: {
	readonly src: string;
	readonly mediaMetadata: unknown;
}) => {
	(async () => {
		const database = await getWritableDatabase(src);
		if (!database) {
			return;
		}

		const transaction = database.transaction('sources', 'readwrite');
		const sources = transaction.objectStore('sources');
		const source: SourceRecord | undefined = await toPromise(sources.get(src));
		// The source was evicted or the cache was cleared in the meantime.
		if (!source) {
			transaction.abort();
			return;
		}

		sources.put({...source, mediaMetadata} satisfies SourceRecord);
		await transactionDone(transaction);
	})().catch(onWriteError);
};

export const readWaveformFromPersistentCache = async ({
	src,
	waveformSampleRate,
}: {
	readonly src: string;
	readonly waveformSampleRate: number;
}): Promise<WaveformResult | null> => {
	try {
		const database = await getReadableDatabase(src);
		if (!database) {
			return null;
		}

		const record: WaveformRecord | undefined = await toPromise(
			database
				.transaction('waveforms')
				.objectStore('waveforms')
				.get([src, waveformSampleRate]),
		);
		if (!record) {
			return null;
		}

		const peaks = dequantizeWaveformPeaks(record.peaks);
		return {
			peaks,
			maxima: getWaveformMaxima(peaks, null),
			averageVolume: record.averageVolume,
		};
	} catch {
		return null;
	}
};

export const writeWaveformToPersistentCache = ({
	src,
	waveformSampleRate,
	result,
}: {
	readonly src: string;
	readonly waveformSampleRate: number;
	readonly result: WaveformResult;
}) => {
	(async () => {
		const database = await getWritableDatabase(src);
		if (!database) {
			return;
		}

		const peaks = quantizeWaveformPeaks(result.peaks);
		const transaction = database.transaction(
			['sources', 'waveforms'],
			'readwrite',
		);
		const sources = transaction.objectStore('sources');
		const waveforms = transaction.objectStore('waveforms');
		const [source, existing] = await Promise.all([
			toPromise<SourceRecord | undefined>(sources.get(src)),
			toPromise<WaveformRecord | undefined>(
				waveforms.get([src, waveformSampleRate]),
			),
		]);
		// The source was evicted or the cache was cleared in the meantime.
		if (!source) {
			transaction.abort();
			return;
		}

		waveforms.put({
			src,
			waveformSampleRate,
			peaks,
			averageVolume: result.averageVolume,
		} satisfies WaveformRecord);
		sources.put({
			...source,
			waveformBytes:
				source.waveformBytes -
				(existing?.peaks.byteLength ?? 0) +
				peaks.byteLength,
		} satisfies SourceRecord);
		await transactionDone(transaction);
		scheduleEviction();
	})().catch(onWriteError);
};

// Loads the persisted thumbnails that fit the slots of a filmstrip into the
// in-memory frame database, so they can be drawn without decoding the video.
// Slots without a fitting thumbnail are decoded afterwards.
export const hydrateThumbnailsFromPersistentCache = async ({
	src,
	height,
	getTimestamps,
}: {
	readonly src: string;
	readonly height: number;
	// Called once the aspect ratio of a persisted source is restored.
	readonly getTimestamps: () => number[];
}): Promise<void> => {
	try {
		const database = await getReadableDatabase(src);
		if (!database) {
			return;
		}

		// Segments without a width produce slots that are not finite.
		const timestamps = getTimestamps().filter((timestamp) =>
			Number.isFinite(timestamp),
		);
		if (timestamps.length === 0) {
			return;
		}

		const tolerance = getSlotTolerance(timestamps);
		const from = Math.min(...timestamps) - tolerance;
		const to = Math.max(...timestamps) + tolerance;
		const store = database.transaction('thumbnails').objectStore('thumbnails');
		// A frame of a low or variable frame rate video, or the last frame of a
		// video, can be shown long after its timestamp.
		const previousRequest = store.openCursor(
			IDBKeyRange.bound([src, height], [src, height, from], false, true),
			'prev',
		);
		const recordsRequest = store.getAll(
			IDBKeyRange.bound([src, height, from], [src, height, to]),
		);
		const [previous, records] = await Promise.all([
			toPromise(previousRequest),
			toPromise<ThumbnailRecord[]>(recordsRequest),
		]);
		const candidates: ThumbnailRecord[] = previous
			? [previous.value, ...records]
			: records;

		const fitting = new Set<ThumbnailRecord>();
		for (const slot of timestamps) {
			let best: ThumbnailRecord | undefined;
			let bestDistance = Infinity;
			for (const candidate of candidates) {
				const distance = getFrameDistance({
					src,
					frameTimestamp: candidate.timestamp,
					frameDuration: candidate.duration,
					slot,
				});
				if (distance < bestDistance) {
					bestDistance = distance;
					best = candidate;
				}
			}

			if (best && bestDistance <= tolerance) {
				fitting.add(best);
			}
		}

		await Promise.all(
			Array.from(fitting).map(async (record) => {
				const key = makeFrameDatabaseKey(src, record.timestamp);
				if (frameDatabase.has(key)) {
					return;
				}

				const bitmap = await createImageBitmap(record.image);
				try {
					addFrameToCache(
						key,
						new VideoFrame(bitmap, {
							timestamp: record.timestamp,
							duration: record.duration ?? undefined,
						}),
					);
				} finally {
					bitmap.close();
				}
			}),
		);
	} catch {
		// The cache is best-effort, missing frames are decoded instead.
	}
};

const flushThumbnails = async () => {
	thumbnailFlushTimeout = null;
	const batch = pendingThumbnails;
	pendingThumbnails = [];

	// Clips with the same source extract the same frames. Deduplicate them, the
	// byte count would otherwise include every copy.
	const bySrc = new Map<string, Map<string, PendingThumbnail>>();
	for (const thumbnail of batch) {
		const thumbnails = bySrc.get(thumbnail.src) ?? new Map();
		thumbnails.set(`${thumbnail.height}:${thumbnail.timestamp}`, thumbnail);
		bySrc.set(thumbnail.src, thumbnails);
	}

	for (const [src, byKey] of bySrc) {
		const thumbnails = Array.from(byKey.values());
		try {
			const database = await getWritableDatabase(src);
			if (!database) {
				continue;
			}

			// Encode before opening the transaction, it would commit while waiting.
			const images = await Promise.all(thumbnails.map((t) => t.image));
			const transaction = database.transaction(
				['sources', 'thumbnails'],
				'readwrite',
			);
			const sources = transaction.objectStore('sources');
			const store = transaction.objectStore('thumbnails');
			const source: SourceRecord | undefined = await toPromise(
				sources.get(src),
			);
			if (!source) {
				transaction.abort();
				continue;
			}

			const createdAt = Date.now();
			let {thumbnailBytes} = source;
			await Promise.all(
				thumbnails.map(async (thumbnail, i) => {
					const existing: ThumbnailRecord | undefined = await toPromise(
						store.get([src, thumbnail.height, thumbnail.timestamp]),
					);
					thumbnailBytes += images[i].size - (existing?.image.size ?? 0);
					store.put({
						src,
						height: thumbnail.height,
						timestamp: thumbnail.timestamp,
						duration: thumbnail.duration,
						createdAt,
						image: images[i],
					} satisfies ThumbnailRecord);
				}),
			);
			sources.put({
				...source,
				aspectRatio:
					thumbnails[thumbnails.length - 1].aspectRatio ?? source.aspectRatio,
				durationInSeconds:
					thumbnails[thumbnails.length - 1].durationInSeconds ??
					source.durationInSeconds,
				thumbnailBytes,
			} satisfies SourceRecord);
			await transactionDone(transaction);
		} catch (error) {
			onWriteError(error);
		}
	}

	scheduleEviction();
};

// Copies the frame, so the caller may close it right away.
export const writeThumbnailToPersistentCache = ({
	src,
	frame,
}: {
	readonly src: string;
	readonly frame: VideoFrame;
}) => {
	if (typeof OffscreenCanvas === 'undefined') {
		return;
	}

	const canvas = new OffscreenCanvas(frame.displayWidth, frame.displayHeight);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		return;
	}

	ctx.drawImage(frame, 0, 0);
	// WebP keeps transparency and is small. Browsers that can't encode it fall
	// back to PNG, which is larger but still correct.
	const image = canvas.convertToBlob({type: 'image/webp', quality: 0.8});
	image.catch(() => undefined);
	pendingThumbnails.push({
		src,
		aspectRatio: aspectRatioCache.get(src) ?? null,
		durationInSeconds: mediaDurationCache.get(src) ?? null,
		height: frame.displayHeight,
		timestamp: frame.timestamp,
		duration: frame.duration,
		image,
	});

	if (thumbnailFlushTimeout === null) {
		thumbnailFlushTimeout = setTimeout(() => {
			flushThumbnails().catch(() => undefined);
		}, THUMBNAIL_FLUSH_DELAY_MS);
	}
};

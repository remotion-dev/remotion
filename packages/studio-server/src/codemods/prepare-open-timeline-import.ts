import {randomUUID} from 'node:crypto';
import {
	closeSync,
	existsSync,
	openSync,
	readSync,
	readdirSync,
	realpathSync,
	statSync,
} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
	generateOpenTimelineComposition,
	type OpenTimelineMediaResolver,
} from '@remotion/codemods';
import {
	detectFileType,
	type PrepareOpenTimelineImportRequest,
} from '@remotion/studio-shared';
import {getOpenTimelineMediaRange} from './get-open-timeline-media-range';

export const prepareOpenTimelineImport = async ({
	request,
	publicDir,
	remotionRoot,
	binariesDirectory,
}: {
	request: PrepareOpenTimelineImportRequest;
	publicDir: string;
	remotionRoot: string;
	binariesDirectory: string | null;
}) => {
	const copies = new Map<string, {source: string; destination: string}>();
	const resolved = new Map<string, ReturnType<OpenTimelineMediaResolver>>();
	const sequences = new Map<string, string>();
	const mediaToProbe = new Map<
		string,
		{
			source: string;
			kind: 'video' | 'audio';
			references: {reference: object; path: string}[];
		}
	>();
	const probeErrors = new Map<string, Error>();
	const importDirectory = `opentimeline/${randomUUID()}`;
	const realPublicDir = existsSync(publicDir)
		? realpathSync(publicDir)
		: path.resolve(publicDir);
	let hasRelativeMedia = false;
	const isRecord = (value: unknown): value is Record<string, unknown> =>
		typeof value === 'object' && value !== null && !Array.isArray(value);
	const resolvePath = (target: string) => {
		const absolute = /^file:/i.test(target)
			? fileURLToPath(target)
			: path.isAbsolute(target)
				? target
				: null;
		if (absolute !== null) {
			if (existsSync(absolute) || request.mediaDirectory === null)
				return absolute;
			return path.resolve(
				remotionRoot,
				request.mediaDirectory,
				path.basename(absolute),
			);
		}

		hasRelativeMedia = true;
		const relative = decodeURIComponent(target);
		const publicPath = path.resolve(publicDir, relative);
		if (request.mediaDirectory === null && existsSync(publicPath))
			return publicPath;
		const resolvedPath = path.resolve(
			remotionRoot,
			request.mediaDirectory ?? '.',
			relative,
		);
		if (existsSync(resolvedPath) || request.mediaDirectory === null)
			return resolvedPath;
		return path.resolve(
			remotionRoot,
			request.mediaDirectory,
			path.basename(relative),
		);
	};

	const publicPathFor = (source: string) => {
		const relative = path.relative(realPublicDir, source);
		return relative !== '..' &&
			!relative.startsWith(`..${path.sep}`) &&
			!path.isAbsolute(relative)
			? relative.split(path.sep).join('/')
			: null;
	};

	const inspectFile = (source: string): 'video' | 'audio' | 'image' => {
		const stat = statSync(source);
		if (!stat.isFile() || stat.size === 0)
			throw new Error(`Media is not a nonempty file: ${source}`);
		const header = new Uint8Array(Math.min(stat.size, 64 * 1024));
		const fd = openSync(source, 'r');
		try {
			readSync(fd, header, 0, header.length, 0);
		} finally {
			closeSync(fd);
		}

		const type = detectFileType(header);
		if (
			['iso-base-media', 'webm', 'riff', 'transport-stream'].includes(type.type)
		)
			return 'video';
		if (['mp3', 'aac', 'wav', 'flac'].includes(type.type)) return 'audio';
		if (
			['png', 'jpeg', 'bmp'].includes(type.type) ||
			(type.type === 'webp' && !type.animated)
		)
			return 'image';
		if (
			path.extname(source).toLowerCase() === '.svg' &&
			/<svg[\s>]/i.test(new TextDecoder().decode(header))
		)
			return 'image';
		throw new Error(`Unsupported media file: ${source}`);
	};

	const resolveMedia: OpenTimelineMediaResolver = (options) => {
		const probeError = probeErrors.get(options.path);
		if (probeError) throw probeError;
		const cached = resolved.get(options.path);
		if (cached !== undefined) return cached;
		const {reference, targetUrl, trackKind} = options;
		if (targetUrl === null || /^(https?:|data:|blob:)/i.test(targetUrl))
			return null;
		if (
			!['ExternalReference.1', 'ImageSequenceReference.1'].includes(
				String(reference.OTIO_SCHEMA),
			)
		)
			return null;
		if (
			/^[a-z][a-z\d+.-]*:/i.test(targetUrl) &&
			!/^file:/i.test(targetUrl) &&
			!path.isAbsolute(targetUrl)
		)
			return null;
		let source: string;
		try {
			source = realpathSync(resolvePath(targetUrl));
		} catch {
			throw new Error(`Media not found: ${targetUrl}`);
		}

		if (reference.OTIO_SCHEMA === 'ImageSequenceReference.1') {
			const key = JSON.stringify([source, reference]);
			const existingSequence = sequences.get(key);
			if (existingSequence !== undefined)
				return {src: existingSequence, source: 'public', kind: 'image'};
			const available = reference.available_range;
			const duration = isRecord(available) ? available.duration : null;
			const {
				rate,
				frame_step: step,
				start_frame: start,
				frame_zero_padding: padding,
				name_prefix: prefix,
				name_suffix: suffix,
			} = reference;
			if (
				!isRecord(duration) ||
				typeof duration.value !== 'number' ||
				typeof duration.rate !== 'number' ||
				typeof rate !== 'number' ||
				typeof step !== 'number' ||
				typeof start !== 'number' ||
				typeof padding !== 'number' ||
				typeof prefix !== 'string' ||
				typeof suffix !== 'string'
			)
				return null;
			const intervals = ((duration.value / duration.rate) * rate) / step;
			const count = Math.round(intervals);
			if (
				!Number.isSafeInteger(count) ||
				Math.abs(count - intervals) > 1e-8 ||
				count <= 0 ||
				!Number.isSafeInteger(padding) ||
				padding < 0 ||
				padding > 100 ||
				step <= 0
			)
				return null;
			const matching = readdirSync(source).filter((name) => {
				if (!name.startsWith(prefix) || !name.endsWith(suffix)) return false;
				const frame = Number(
					name.slice(prefix.length, name.length - suffix.length),
				);
				const index = (frame - start) / step;
				const formatted = `${frame < 0 ? '-' : ''}${String(Math.abs(frame)).padStart(padding, '0')}`;
				return (
					Number.isSafeInteger(index) &&
					index >= 0 &&
					index < count &&
					name === `${prefix}${formatted}${suffix}`
				);
			});
			if (matching.length !== count)
				throw new Error(
					`Image sequence ${targetUrl} has ${matching.length} of ${count} required frames.`,
				);
			const sequenceDestination =
				publicPathFor(source) ??
				`${importDirectory}/sequence-${sequences.size + 1}`;
			for (const name of matching) {
				const file = realpathSync(path.join(source, name));
				if (inspectFile(file) !== 'image')
					throw new Error(`Image sequence frame is not a still image: ${file}`);
				if (publicPathFor(source) === null) {
					const output = path.join(publicDir, sequenceDestination, name);
					copies.set(output, {source: file, destination: output});
				}
			}

			sequences.set(key, sequenceDestination);
			return {src: sequenceDestination, source: 'public', kind: 'image'};
		}

		const kind = inspectFile(source);
		const existing = [...copies.values()].find(
			(copy) => copy.source === source,
		);
		const destination =
			existing?.destination ??
			path.join(
				publicDir,
				importDirectory,
				`${copies.size + 1}-${path.basename(source)}`,
			);
		const src =
			publicPathFor(source) ??
			path.relative(publicDir, destination).split(path.sep).join('/');
		if (publicPathFor(source) === null)
			copies.set(destination, {source, destination});
		const media = {
			src,
			source: 'public' as const,
			kind:
				trackKind === 'Audio' && kind === 'video' ? ('audio' as const) : kind,
		};
		if (
			kind !== 'image' &&
			(reference.available_range === null ||
				reference.available_range === undefined)
		) {
			const probeKey = JSON.stringify([source, media.kind]);
			const entry = mediaToProbe.get(probeKey) ?? {
				source,
				kind: media.kind as 'video' | 'audio',
				references: [],
			};
			entry.references.push({reference, path: options.path});
			mediaToProbe.set(probeKey, entry);
		}

		resolved.set(options.path, media);
		return media;
	};

	let timeline: unknown;
	try {
		timeline = JSON.parse(request.contents);
	} catch {
		timeline = request.contents;
	}

	const generate = () =>
		generateOpenTimelineComposition({
			timeline,
			componentName: request.componentName,
			fps: request.fps,
			width: request.width,
			height: request.height,
			resolveMedia,
		});
	let result = generate();
	const ranges = new Map<
		object,
		Awaited<ReturnType<typeof getOpenTimelineMediaRange>>
	>();
	const probes = [...mediaToProbe.values()];
	for (let index = 0; index < probes.length; index += 4) {
		await Promise.all(
			probes.slice(index, index + 4).map(async (probe) => {
				try {
					const range = await getOpenTimelineMediaRange({
						src: probe.source,
						kind: probe.kind,
						binariesDirectory,
					});
					for (const {reference} of probe.references)
						ranges.set(reference, range);
				} catch (error) {
					for (const reference of probe.references) {
						probeErrors.set(
							reference.path,
							error instanceof Error ? error : new Error(String(error)),
						);
					}
				}
			}),
		);
	}

	if (probes.length > 0) {
		timeline = JSON.parse(
			JSON.stringify(timeline, (_key, value) => {
				const range = ranges.get(value);
				return range ? {...value, available_range: range} : value;
			}),
		);
		result = generate();
	}

	return {
		result,
		timeline,
		copies: [...copies.values()],
		resolveMedia,
		hasRelativeMedia,
	};
};

import * as recast from 'recast';
import type {CompositionMetadata} from '../composition-editing';
import {parseAst} from '../sequence-props/parse-ast';
import {normalizeOpenTimeline} from './normalize';
import type {
	OpenTimelineAnnotation,
	OpenTimelineDiagnostic,
	OpenTimelineNode,
} from './types';

export type {OpenTimelineAnnotation, OpenTimelineDiagnostic} from './types';

export type OpenTimelineResolvedMedia = {
	src: string;
	source: 'url' | 'public';
	kind: 'video' | 'audio' | 'image';
};

/** For image sequences, targetUrl and the returned src are directory bases. */
export type OpenTimelineMediaResolver = (options: {
	reference: Readonly<Record<string, unknown>>;
	targetUrl: string | null;
	path: string;
	trackKind: 'Video' | 'Audio';
}) => OpenTimelineResolvedMedia | null;

export type OpenTimelineAsset = Omit<OpenTimelineResolvedMedia, 'kind'> & {
	path: string;
	kind: OpenTimelineResolvedMedia['kind'] | 'image-sequence';
};

export type GenerateOpenTimelineCompositionOptions = {
	timeline: unknown;
	componentName: string;
	fps: number;
	width: number;
	height: number;
	resolveMedia?: OpenTimelineMediaResolver;
};

export type GenerateOpenTimelineCompositionResult = {
	source: string | null;
	metadata: CompositionMetadata | null;
	diagnostics: OpenTimelineDiagnostic[];
	assets: OpenTimelineAsset[];
	annotations: OpenTimelineAnnotation[];
	globalStartTime: {value: number; rate: number} | null;
};

const literal = (value: string) =>
	JSON.stringify(value)
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
// Remove floating point arithmetic noise without quantizing individual edits.
const number = (value: number) => String(Number(value.toPrecision(15)));

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

type Fade = {start: number; end: number};

/** Pure, synchronous compilation. No filesystem access, media probing or downloads. */
export const generateOpenTimelineComposition = ({
	timeline,
	componentName,
	fps,
	width,
	height,
	resolveMedia,
}: GenerateOpenTimelineCompositionOptions): GenerateOpenTimelineCompositionResult => {
	const normalized = normalizeOpenTimeline(timeline);
	const {diagnostics, annotations, globalStartTime} = normalized;
	const assets: OpenTimelineAsset[] = [];
	const remotionImports = new Set(['AbsoluteFill', 'useVideoConfig']);
	const mediaImports = new Set<string>();
	let usesFrame = false;
	let usesImageSequence = false;
	const localName = (name: string) =>
		name === componentName ? `OpenTimeline${name}` : name;
	const error = (path: string, code: string, message: string) => {
		diagnostics.push({path, code, message, severity: 'error'});
	};

	if (!/^[A-Z][\w$]*$/.test(componentName)) {
		error(
			'$options.componentName',
			'invalid-component-name',
			'Use a component name beginning with an uppercase letter.',
		);
	}

	for (const [key, value] of Object.entries({fps, width, height})) {
		if (
			!Number.isFinite(value) ||
			value <= 0 ||
			(key !== 'fps' && !Number.isSafeInteger(value))
		) {
			error(
				`$options.${key}`,
				'invalid-output-setting',
				`${key} must be a positive ${key === 'fps' ? 'finite number' : 'safe integer'}.`,
			);
		}
	}

	const srcExpression = (
		media: OpenTimelineResolvedMedia,
		expression: string,
	) => {
		if (media.source === 'public') {
			remotionImports.add('staticFile');
			return `staticFile(${expression})`;
		}

		return expression;
	};

	const fadeExpression = (frame: string, fade: Fade, incoming: boolean) => {
		usesFrame = true;
		remotionImports.add('interpolate');
		return `interpolate(${frame}, [${number(fade.start * fps)}, ${number(fade.end * fps)}], ${incoming ? '[0, 1]' : '[1, 0]'}, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})`;
	};

	const renderClip = ({
		node,
		start,
		head,
		tail,
		fadeIn,
		fadeOut,
		frame,
	}: {
		node: OpenTimelineNode;
		start: number;
		head: number;
		tail: number;
		fadeIn: Fade | null;
		fadeOut: Fade | null;
		frame: string;
	}): string => {
		const reference = node.media ?? {OTIO_SCHEMA: 'MissingReference.1'};
		const schema = reference.OTIO_SCHEMA;
		const imageSequence = schema === 'ImageSequenceReference.1';
		const targetUrl = imageSequence
			? reference.target_url_base
			: reference.target_url;
		const target = typeof targetUrl === 'string' ? targetUrl : null;
		let media: OpenTimelineResolvedMedia | null = null;
		if (resolveMedia) {
			try {
				media = resolveMedia({
					reference,
					targetUrl: target,
					path: node.path,
					trackKind: node.kind,
				});
			} catch (err) {
				error(
					node.path,
					'media-resolver-failed',
					`Media resolver failed: ${err instanceof Error ? err.message : String(err)}`,
				);
				return '';
			}
		}

		const resolved = media !== null;
		if (
			!media &&
			(schema === 'ExternalReference.1' || imageSequence) &&
			target !== null
		) {
			const extension = target
				.split(/[?#]/)[0]
				.split('.')
				.at(-1)
				?.toLowerCase();
			const image =
				imageSequence ||
				['png', 'jpg', 'jpeg', 'svg', 'bmp'].includes(extension ?? '');
			if (
				!imageSequence &&
				['gif', 'webp', 'avif', 'apng', 'exr', 'dpx', 'tif', 'tiff'].includes(
					extension ?? '',
				)
			) {
				error(
					node.path,
					'unsupported-image-format',
					'Animated or non-browser image formats require resolveMedia() to provide a supported still or video.',
				);
				return '';
			}

			if (/^(https?:|data:|blob:)/i.test(target)) {
				media = {
					src: target,
					source: 'url',
					kind: node.kind === 'Audio' ? 'audio' : image ? 'image' : 'video',
				};
			} else if (
				!/^(?:[a-z][a-z\d+.-]*:|[\\/])/i.test(target) &&
				!target.split(/[\\/]/).includes('..') &&
				!target.includes('\\')
			) {
				media = {
					src: target.replace(/^\.\//, ''),
					source: 'public',
					kind: node.kind === 'Audio' ? 'audio' : image ? 'image' : 'video',
				};
			}
		}

		if (!media) {
			error(
				node.path,
				'unresolved-media',
				`Cannot resolve ${String(schema)}${target ? ` (${target})` : ''}. Use resolveMedia() to supply a browser URL or public asset.`,
			);
			return '';
		}

		if (
			typeof media.src !== 'string' ||
			(!imageSequence && media.src.length === 0) ||
			!['url', 'public'].includes(media.source) ||
			!['video', 'audio', 'image'].includes(media.kind)
		) {
			error(
				node.path,
				'invalid-media-resolution',
				'resolveMedia() must return a nonempty src, source (url/public), and kind (video/audio/image).',
			);
			return '';
		}

		if (
			(node.kind === 'Audio' && media.kind === 'image') ||
			(node.kind === 'Video' && media.kind === 'audio') ||
			(imageSequence && media.kind !== 'image')
		) {
			error(
				node.path,
				'incompatible-media-kind',
				'The resolved media kind is incompatible with the OTIO track or image sequence.',
			);
			return '';
		}

		if (
			![
				'ExternalReference.1',
				'ImageSequenceReference.1',
				'MissingReference.1',
				'GeneratorReference.1',
			].includes(String(schema))
		) {
			error(
				node.path,
				'unsupported-media-schema',
				`Unsupported media reference schema: ${String(schema)}.`,
			);
			return '';
		}

		const available = isRecord(reference.available_range)
			? reference.available_range
			: null;
		const availableStart =
			available && isRecord(available.start_time)
				? Number(available.start_time.value) / Number(available.start_time.rate)
				: 0;
		const availableDuration =
			available && isRecord(available.duration)
				? Number(available.duration.value) / Number(available.duration.rate)
				: null;
		const speed = node.freeze ? 1 : node.playbackRate;
		const duration = node.duration + head + tail;
		const offset =
			node.sourceStart - availableStart - (node.freeze ? 0 : head * speed);
		if (
			offset < -1e-8 ||
			(availableDuration !== null &&
				(node.freeze
					? offset >= availableDuration
					: offset + duration * speed > availableDuration + 1e-8))
		) {
			error(
				node.path,
				'insufficient-media-range',
				'The selected media range, speed, or transition handles extend beyond the available media.',
			);
			return '';
		}

		const trim = Math.max(0, offset);
		if (
			[start * fps, trim * fps, duration * fps * speed].some(
				(value) =>
					!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER,
			)
		) {
			error(
				node.path,
				'unsafe-frame-range',
				'The media timing exceeds the safe numeric frame range.',
			);
			return '';
		}

		assets.push({
			...media,
			kind: imageSequence ? 'image-sequence' : media.kind,
			path: node.path,
		});
		let src = srcExpression(media, literal(media.src));
		if (imageSequence) {
			const {rate} = reference;
			const step = reference.frame_step;
			const first = reference.start_frame;
			const padding = reference.frame_zero_padding;
			if (
				typeof rate !== 'number' ||
				!Number.isFinite(rate) ||
				rate <= 0 ||
				typeof step !== 'number' ||
				!Number.isSafeInteger(step) ||
				step <= 0 ||
				typeof first !== 'number' ||
				!Number.isSafeInteger(first) ||
				typeof padding !== 'number' ||
				!Number.isSafeInteger(padding) ||
				padding < 0 ||
				padding > 100 ||
				typeof reference.name_prefix !== 'string' ||
				typeof reference.name_suffix !== 'string' ||
				availableDuration === null ||
				availableDuration <= 0
			) {
				error(
					node.path,
					'invalid-image-sequence',
					'Image sequences require an available range, positive rate and frame_step, integer start_frame and padding (0–100), and string prefix/suffix.',
				);
				return '';
			}

			if (
				reference.missing_frame_policy !== undefined &&
				reference.missing_frame_policy !== 'error'
			) {
				error(
					node.path,
					'unsupported-missing-frame-policy',
					'Only the image sequence missing_frame_policy "error" is supported.',
				);
				return '';
			}

			const imageIntervals = (availableDuration * rate) / step;
			const imageCount = Math.round(imageIntervals);
			if (
				!Number.isSafeInteger(imageCount) ||
				imageCount <= 0 ||
				Math.abs(imageCount - imageIntervals) > 1e-8 ||
				!Number.isSafeInteger(first + (imageCount - 1) * step)
			) {
				error(
					node.path,
					'invalid-image-sequence',
					'The available range must contain a positive whole number of frame_step intervals, and the last frame number must be a safe integer.',
				);
				return '';
			}

			if (!resolved && !/\.(png|jpe?g|svg|bmp)$/i.test(reference.name_suffix)) {
				error(
					node.path,
					'unsupported-image-format',
					'This image sequence format requires asset conversion and resolveMedia().',
				);
				return '';
			}

			usesImageSequence = true;
			usesFrame = true;
			const elapsed = node.freeze
				? number(trim)
				: `(${number(trim)} + ((${frame}) - ${number(start * fps)}) / fps * ${number(speed)})`;
			const index = `Math.max(0, Math.min(${number(imageCount - 1)}, Math.floor(${elapsed} * ${number(rate)} / ${number(step)} + 1e-8)))`;
			const base =
				!media.src || media.src.endsWith('/') ? media.src : `${media.src}/`;
			src = srcExpression(
				media,
				`${literal(base + reference.name_prefix)} + formatOpenTimelineFrame(${number(first)} + ${index} * ${number(step)}, ${number(padding)}) + ${literal(reference.name_suffix)}`,
			);
		}

		const audio = node.kind === 'Audio';
		const tag = audio
			? 'Audio'
			: media.kind === 'image'
				? 'CanvasImage'
				: 'Video';
		if (tag === 'CanvasImage') {
			remotionImports.add(tag);
		} else {
			mediaImports.add(tag);
		}

		const props = [
			`name={${literal(node.name)}}`,
			`src={${src}}`,
			`from={${number(start * fps)}}`,
			`durationInFrames={${number(duration * fps * (tag === 'CanvasImage' ? 1 : speed))}}`,
			'premountFor={fps}',
		];
		if (tag !== 'CanvasImage') {
			props.push(`trimBefore={${number(trim * fps)}}`);
			if (speed !== 1) {
				props.push(`playbackRate={${number(speed)}}`);
			}

			if (node.freeze) {
				props.push('freeze={0}');
			}
		}

		if (audio && (fadeIn || fadeOut)) {
			props.push(
				`volume={${[fadeIn ? fadeExpression(frame, fadeIn, true) : null, fadeOut ? fadeExpression(frame, fadeOut, false) : null].filter(Boolean).join(' * ')}}`,
			);
		}

		if (tag === 'Video') {
			props.push('muted', 'objectFit="contain"');
		}

		if (tag === 'CanvasImage') {
			props.push('fit="contain"');
		}

		if (!audio) {
			const opacity = [
				fadeIn ? fadeExpression(frame, fadeIn, true) : null,
				fadeOut ? fadeExpression(frame, fadeOut, false) : null,
			]
				.filter(Boolean)
				.join(' * ');
			props.push(
				`style={{position: 'absolute', width: '100%', height: '100%', ${opacity ? `opacity: ${opacity}, mixBlendMode: 'plus-lighter',` : ''}}}`,
			);
		}

		return `<${localName(tag)} ${props.join(' ')} />`;
	};

	const render = (
		node: OpenTimelineNode,
		start: number,
		frame: string,
	): string => {
		if (
			!node.enabled ||
			node.duration === 0 ||
			node.type === 'gap' ||
			node.type === 'transition'
		) {
			return '';
		}

		if (
			[start * fps, node.sourceStart * fps, node.duration * fps].some(
				(value) =>
					!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER,
			)
		) {
			error(
				node.path,
				'unsafe-frame-range',
				'The item timing exceeds the safe numeric frame range.',
			);
			return '';
		}

		if (node.type === 'clip') {
			return renderClip({
				node,
				start,
				head: 0,
				tail: 0,
				fadeIn: null,
				fadeOut: null,
				frame,
			});
		}

		remotionImports.add('Sequence');
		const childFrame = `(${frame} - ${number(start * fps)} + ${number(node.sourceStart * fps)})`;
		let cursor = 0;
		const children = node.children
			.map((child, index) => {
				if (node.type === 'stack') {
					return render(child, 0, childFrame);
				}

				if (child.type === 'transition') {
					return '';
				}

				const position = cursor;
				cursor += child.duration;
				const before = node.children[index - 1];
				const after = node.children[index + 1];
				const incoming = before?.enabled ? before.transition : null;
				const outgoing = after?.enabled ? after.transition : null;
				if (!incoming && !outgoing) {
					return render(child, position, childFrame);
				}

				if (child.type !== 'clip' && child.type !== 'gap') {
					error(
						child.path,
						'unsupported-transition-neighbor',
						'Dissolves adjoining nested compositions are not supported.',
					);
					return '';
				}

				if (!child.enabled || child.type === 'gap') {
					return '';
				}

				return renderClip({
					node: child,
					start: position - (incoming?.inOffset ?? 0),
					head: incoming?.inOffset ?? 0,
					tail: outgoing?.outOffset ?? 0,
					fadeIn: incoming
						? {
								start: position - incoming.inOffset,
								end: position + incoming.outOffset,
							}
						: null,
					fadeOut: outgoing
						? {
								start: cursor - outgoing.inOffset,
								end: cursor + outgoing.outOffset,
							}
						: null,
					frame: childFrame,
				});
			})
			.filter(Boolean)
			.join('\n');
		// Negative composition source time selects empty time before its children.
		// Sequence trims are nonnegative, so delay the child timeline in this case.
		const content =
			node.sourceStart < 0
				? `<${localName('Sequence')} from={${number(-node.sourceStart * fps)}} premountFor={fps}>${children}</${localName('Sequence')}>`
				: children;
		// Additive blending of the two weighted clips preserves alpha during a
		// dissolve. Isolate each track so its fades cannot add to lower tracks.
		const isolation =
			node.type === 'track' ? ` style={{isolation: 'isolate'}}` : '';
		return `<${localName('Sequence')} name={${literal(node.name)}} from={${number(start * fps)}} trimBefore={${number(Math.max(0, node.sourceStart) * fps)}} durationInFrames={${number(node.duration * fps)}} premountFor={fps}${isolation}>${content}</${localName('Sequence')}>`;
	};

	let body = '';
	let durationInFrames = 0;
	if (normalized.root && Number.isFinite(fps) && fps > 0) {
		durationInFrames = Math.ceil(
			Number((normalized.root.duration * fps).toPrecision(15)),
		);
		if (!Number.isSafeInteger(durationInFrames) || durationInFrames <= 0) {
			error(
				'$.tracks',
				'invalid-duration',
				'The timeline must have a positive, finite duration within the safe frame range.',
			);
		} else {
			body = render(normalized.root, 0, 'frame');
		}
	}

	const result = {diagnostics, assets, annotations, globalStartTime};
	if (
		!normalized.root ||
		diagnostics.some((diagnostic) => diagnostic.severity === 'error')
	) {
		return {...result, source: null, metadata: null};
	}

	if (usesFrame) {
		remotionImports.add('useCurrentFrame');
	}

	// Alias imports that would otherwise collide with a caller's component name.
	const imports = [...remotionImports]
		.sort()
		.map((name) =>
			name === componentName ? `${name} as OpenTimeline${name}` : name,
		);
	const mediaImportNames = [...mediaImports]
		.sort()
		.map((name) =>
			name === componentName ? `${name} as OpenTimeline${name}` : name,
		);

	const helper = usesImageSequence
		? `const formatOpenTimelineFrame = (value: number, padding: number) => (value < 0 ? '-' : '') + String(Math.abs(value)).padStart(padding, '0');`
		: '';
	const source = `import {${imports.join(', ')}} from 'remotion';
${mediaImports.size ? `import {${mediaImportNames.join(', ')}} from '@remotion/media';` : ''}
${helper}
export const ${componentName} = () => {
const {fps} = useVideoConfig();
${usesFrame ? 'const frame = useCurrentFrame();' : ''}
return <${localName('AbsoluteFill')} premountFor={fps} style={{backgroundColor: 'black'}}>${body}</${localName('AbsoluteFill')}>;
};`;
	// The parser is also a final check that untrusted strings remain data in TSX.
	return {
		...result,
		metadata: {width, height, fps, durationInFrames},
		source: `${recast.prettyPrint(parseAst(source), {quote: 'single', useTabs: true, tabWidth: 2}).code}\n`,
	};
};

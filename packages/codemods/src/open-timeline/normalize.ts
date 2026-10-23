import type {NormalizedOpenTimeline, OpenTimelineNode} from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

/** Read the OTIO JSON model without probing assets or depending on wall-clock state. */
export const normalizeOpenTimeline = (
	timeline: unknown,
): NormalizedOpenTimeline => {
	const result: NormalizedOpenTimeline = {
		root: null,
		diagnostics: [],
		annotations: [],
		globalStartTime: null,
	};
	const error = (code: string, path: string, message: string) => {
		result.diagnostics.push({code, severity: 'error', path, message});
	};

	const time = (value: unknown, path: string): number | null => {
		if (!isRecord(value) || value.OTIO_SCHEMA !== 'RationalTime.1') {
			error('invalid-time', path, 'Expected a RationalTime.1 object.');
			return null;
		}

		if (
			typeof value.value !== 'number' ||
			!Number.isFinite(value.value) ||
			typeof value.rate !== 'number' ||
			!Number.isFinite(value.rate) ||
			value.rate <= 0 ||
			!Number.isFinite(value.value / value.rate)
		) {
			error(
				'invalid-time',
				path,
				'Time values must be finite and rates must be positive.',
			);
			return null;
		}

		return value.value / value.rate;
	};

	const range = (
		value: unknown,
		path: string,
	): {start: number; duration: number} | null => {
		if (!isRecord(value) || value.OTIO_SCHEMA !== 'TimeRange.1') {
			error('invalid-range', path, 'Expected a TimeRange.1 object.');
			return null;
		}

		const start = time(value.start_time, `${path}.start_time`);
		const duration = time(value.duration, `${path}.duration`);
		if (duration !== null && duration < 0) {
			error(
				'invalid-range',
				`${path}.duration`,
				'A duration cannot be negative.',
			);
			return null;
		}

		if (
			start !== null &&
			duration !== null &&
			!Number.isFinite(start + duration)
		) {
			error(
				'invalid-range',
				path,
				'The range endpoint exceeds the finite numeric range.',
			);
			return null;
		}

		return start === null || duration === null ? null : {start, duration};
	};

	const annotate = (value: Record<string, unknown>, path: string) => {
		if (
			value.metadata !== undefined &&
			value.metadata !== null &&
			!isRecord(value.metadata)
		) {
			error(
				'invalid-metadata',
				`${path}.metadata`,
				'Metadata must be an object.',
			);
		}

		if (value.markers !== undefined && !Array.isArray(value.markers)) {
			error('invalid-markers', `${path}.markers`, 'Markers must be an array.');
		}

		const markers = Array.isArray(value.markers) ? value.markers : [];
		for (const [index, marker] of markers.entries()) {
			const markerPath = `${path}.markers[${index}]`;
			if (
				!isRecord(marker) ||
				!['Marker.1', 'Marker.2', 'Marker.3'].includes(
					String(marker.OTIO_SCHEMA),
				)
			) {
				error(
					'unsupported-marker',
					markerPath,
					'Expected Marker.1, Marker.2, or Marker.3.',
				);
				continue;
			}

			const rangeKey =
				marker.OTIO_SCHEMA === 'Marker.1' ? 'range' : 'marked_range';
			if (marker[rangeKey] !== undefined && marker[rangeKey] !== null) {
				range(marker[rangeKey], `${markerPath}.${rangeKey}`);
			}
		}

		const metadata = isRecord(value.metadata) ? value.metadata : null;
		if (metadata !== null || markers.length > 0) {
			result.annotations.push({path, metadata, markers});
		}

		// OTIO color is an editorial UI label, never a pixel color.
		if (value.color !== undefined && value.color !== null) {
			result.diagnostics.push({
				code: 'editorial-color',
				severity: 'info',
				path: `${path}.color`,
				message:
					'Editorial item colors have no rendering semantics and are not applied to pixels.',
			});
		}

		if (
			value.available_image_bounds !== undefined &&
			value.available_image_bounds !== null
		) {
			result.diagnostics.push({
				code: 'available-image-bounds',
				severity: 'info',
				path: `${path}.available_image_bounds`,
				message:
					'Available image bounds describe the source image and are not applied as a crop or output size.',
			});
		}
	};

	let input = timeline;
	if (typeof timeline === 'string') {
		try {
			input = JSON.parse(timeline);
		} catch {
			error('invalid-json', '$', 'The timeline is not valid JSON.');
			return result;
		}
	}

	if (!isRecord(input) || input.OTIO_SCHEMA !== 'Timeline.1') {
		error(
			'unsupported-root',
			'$',
			'Expected a Timeline.1 object. Select a timeline from a collection before importing.',
		);
		return result;
	}

	annotate(input, '$');
	if (
		input.global_start_time !== undefined &&
		input.global_start_time !== null
	) {
		if (
			time(input.global_start_time, '$.global_start_time') !== null &&
			isRecord(input.global_start_time)
		) {
			result.globalStartTime = {
				value: input.global_start_time.value as number,
				rate: input.global_start_time.rate as number,
			};
		}
	}

	const ancestors = new Set<object>();
	const item = (
		value: unknown,
		path: string,
		context: {kind: 'Video' | 'Audio'; enabled: boolean; depth: number},
	): OpenTimelineNode | null => {
		if (!isRecord(value)) {
			error('invalid-item', path, 'Expected an OTIO item object.');
			return null;
		}

		if (context.depth > 128 || ancestors.has(value)) {
			error(
				'invalid-hierarchy',
				path,
				'Timeline nesting exceeds 128 levels or contains a cycle.',
			);
			return null;
		}

		const schema = value.OTIO_SCHEMA;
		const type =
			schema === 'Track.1' || schema === 'Sequence.1'
				? 'track'
				: schema === 'Stack.1'
					? 'stack'
					: schema === 'Clip.1' || schema === 'Clip.2'
						? 'clip'
						: schema === 'Gap.1' || schema === 'Filler.1'
							? 'gap'
							: schema === 'Transition.1'
								? 'transition'
								: null;
		if (type === null) {
			error(
				'unsupported-schema',
				path,
				`Unsupported OTIO schema: ${String(schema)}.`,
			);
			return null;
		}

		if (value.enabled !== undefined && typeof value.enabled !== 'boolean') {
			error('invalid-enabled', `${path}.enabled`, 'enabled must be a boolean.');
		}

		if (
			value.name !== undefined &&
			value.name !== null &&
			typeof value.name !== 'string'
		) {
			error('invalid-name', `${path}.name`, 'name must be a string or null.');
		}

		annotate(value, path);
		const node: OpenTimelineNode = {
			type,
			path,
			name: typeof value.name === 'string' ? value.name : '',
			duration: 0,
			sourceStart: 0,
			enabled: context.enabled && value.enabled !== false,
			kind: context.kind,
			children: [],
			media: null,
			playbackRate: 1,
			freeze: false,
			transition: null,
		};
		if (type === 'track') {
			if (
				value.kind !== undefined &&
				value.kind !== 'Video' &&
				value.kind !== 'Audio'
			) {
				error(
					'unsupported-track-kind',
					`${path}.kind`,
					'Only Video and Audio tracks are supported.',
				);
			}

			node.kind = value.kind === 'Audio' ? 'Audio' : 'Video';
		}

		const sourceRange =
			value.source_range === undefined || value.source_range === null
				? null
				: range(value.source_range, `${path}.source_range`);
		if (type === 'transition') {
			const inOffset = time(value.in_offset, `${path}.in_offset`);
			const outOffset = time(value.out_offset, `${path}.out_offset`);
			if (inOffset === null || outOffset === null) {
				return null;
			}

			if (inOffset < 0 || outOffset < 0) {
				error(
					'invalid-transition',
					path,
					'Transition offsets must be nonnegative.',
				);
				return null;
			}

			node.duration = inOffset + outOffset;
			if (!Number.isFinite(node.duration)) {
				error(
					'invalid-transition',
					path,
					'The transition duration exceeds the finite numeric range.',
				);
				return null;
			}

			node.transition = {
				inOffset,
				outOffset,
				type: String(value.transition_type ?? ''),
			};
			if (node.enabled && value.transition_type !== 'SMPTE_Dissolve') {
				error(
					'unsupported-transition',
					`${path}.transition_type`,
					`Unsupported transition type: ${String(value.transition_type)}.`,
				);
			}

			if (node.enabled && node.duration === 0) {
				node.enabled = false;
				result.diagnostics.push({
					code: 'zero-duration-transition',
					severity: 'info',
					path,
					message: 'A zero-duration transition is represented as a hard cut.',
				});
			}

			return node;
		}

		if (value.effects !== undefined && !Array.isArray(value.effects)) {
			error('invalid-effects', `${path}.effects`, 'Effects must be an array.');
		}

		const effects = Array.isArray(value.effects) ? value.effects : [];
		let timeEffectCount = 0;
		for (const [index, effect] of effects.entries()) {
			const effectPath = `${path}.effects[${index}]`;
			if (!isRecord(effect)) {
				error('invalid-effect', effectPath, 'Expected an effect object.');
				continue;
			}

			annotate(effect, effectPath);
			if (effect.enabled !== undefined && typeof effect.enabled !== 'boolean') {
				error(
					'invalid-enabled',
					`${effectPath}.enabled`,
					'enabled must be a boolean.',
				);
			}

			if (effect.enabled === false || !node.enabled) {
				continue;
			}

			if (
				effect.OTIO_SCHEMA !== 'LinearTimeWarp.1' &&
				effect.OTIO_SCHEMA !== 'FreezeFrame.1'
			) {
				error(
					'unsupported-effect',
					effectPath,
					`Unsupported effect: ${String(effect.OTIO_SCHEMA)} (${String(effect.effect_name ?? '')}).`,
				);
				continue;
			}

			if (
				effect.OTIO_SCHEMA === 'FreezeFrame.1' &&
				effect.time_scalar !== undefined &&
				effect.time_scalar !== 0
			) {
				error(
					'invalid-time-scalar',
					`${effectPath}.time_scalar`,
					'FreezeFrame.1 time_scalar must be zero when provided.',
				);
				continue;
			}

			const scalar =
				effect.OTIO_SCHEMA === 'FreezeFrame.1' ? 0 : effect.time_scalar;
			if (typeof scalar !== 'number' || !Number.isFinite(scalar)) {
				error(
					'invalid-time-scalar',
					effectPath,
					'time_scalar must be a finite number.',
				);
				continue;
			}

			if (scalar === 1) {
				continue;
			}

			if (type !== 'clip' || scalar < 0) {
				error(
					'unsupported-time-effect',
					effectPath,
					'Only forward clip retiming and clip freeze frames are supported.',
				);
				continue;
			}

			timeEffectCount++;
			if (scalar === 0) {
				node.freeze = true;
			} else {
				node.playbackRate *= scalar;
			}
		}

		if (node.freeze && timeEffectCount > 1) {
			error(
				'unsupported-time-effect',
				`${path}.effects`,
				'Combining a freeze frame with other time effects is unsupported.',
			);
		}

		if (!Number.isFinite(node.playbackRate) || node.playbackRate <= 0) {
			error(
				'invalid-time-scalar',
				`${path}.effects`,
				'The combined playback rate must be positive and finite.',
			);
		}

		if (type === 'clip') {
			let reference: unknown;
			let referencePath = `${path}.media_reference`;
			if (schema === 'Clip.2') {
				const key = value.active_media_reference_key ?? 'OTIO_REF';
				if (
					!isRecord(value.media_references) ||
					typeof key !== 'string' ||
					!Object.prototype.hasOwnProperty.call(value.media_references, key)
				) {
					error(
						'invalid-media-reference',
						`${path}.media_references`,
						'The active media reference key must identify a reference in media_references.',
					);
				} else {
					reference = value.media_references[key];
					referencePath = `${path}.media_references[${JSON.stringify(key)}]`;
				}
			} else {
				reference = value.media_reference;
			}

			if (reference === undefined || reference === null) {
				node.media = {OTIO_SCHEMA: 'MissingReference.1'};
			} else if (!isRecord(reference)) {
				error(
					'invalid-media-reference',
					referencePath,
					'Expected a media reference object.',
				);
			} else {
				node.media = reference;
				annotate(reference, referencePath);
			}

			const available =
				node.media?.available_range === undefined ||
				node.media.available_range === null
					? null
					: range(
							node.media.available_range,
							`${referencePath}.available_range`,
						);
			const selected = sourceRange ?? available;
			if (selected === null) {
				error(
					'missing-duration',
					path,
					'A clip needs source_range or its active media reference needs available_range.',
				);
				return null;
			}

			node.sourceStart = selected.start;
			node.duration = selected.duration;
			return node;
		}

		if (type === 'gap') {
			const legacyDuration =
				sourceRange === null && value.duration !== undefined
					? time(value.duration, `${path}.duration`)
					: null;
			if (sourceRange === null && legacyDuration === null) {
				error(
					'missing-duration',
					path,
					'A gap needs source_range (or a legacy duration).',
				);
				return null;
			}

			node.sourceStart = sourceRange?.start ?? 0;
			node.duration = sourceRange?.duration ?? legacyDuration ?? 0;
			if (node.duration < 0) {
				error('invalid-range', path, 'A gap duration cannot be negative.');
			}

			return node;
		}

		if (!Array.isArray(value.children)) {
			error(
				'invalid-children',
				`${path}.children`,
				'A track or stack needs a children array.',
			);
			return null;
		}

		ancestors.add(value);
		for (const [index, child] of value.children.entries()) {
			const parsed = item(child, `${path}.children[${index}]`, {
				kind: node.kind,
				enabled: node.enabled,
				depth: context.depth + 1,
			});
			if (parsed !== null) {
				node.children.push(parsed);
			}
		}

		ancestors.delete(value);
		if (type === 'stack') {
			for (const child of node.children) {
				if (child.type === 'transition') {
					error(
						'invalid-transition',
						child.path,
						'Transitions must be children of a track.',
					);
				}

				node.duration = Math.max(node.duration, child.duration);
			}
		} else {
			for (const [index, child] of node.children.entries()) {
				if (child.transition === null) {
					node.duration += child.duration;
					continue;
				}

				const previous = node.children[index - 1];
				const next = node.children[index + 1];
				const {inOffset, outOffset} = child.transition;
				if (!previous) {
					node.duration += inOffset;
				}

				if (!next) {
					node.duration += outOffset;
				}

				if (!child.enabled) {
					continue;
				}

				if (!previous || !next) {
					error(
						'unsupported-boundary-transition',
						child.path,
						'Transitions at a track boundary are unsupported. Add explicit gaps around the transition.',
					);
					continue;
				}

				if (previous.type === 'transition' || next.type === 'transition') {
					error(
						'invalid-transition',
						child.path,
						'Adjacent transitions are not allowed.',
					);
					continue;
				}

				if (inOffset > previous.duration || outOffset > next.duration) {
					error(
						'invalid-transition',
						child.path,
						'Transition offsets exceed the neighboring item durations.',
					);
				}

				if (
					(previous.type !== 'clip' && previous.type !== 'gap') ||
					(next.type !== 'clip' && next.type !== 'gap')
				) {
					error(
						'unsupported-nested-transition',
						child.path,
						'Dissolves between nested tracks or stacks are unsupported.',
					);
				}

				const beforePrevious = node.children[index - 2];
				if (
					beforePrevious?.transition &&
					beforePrevious.enabled &&
					beforePrevious.transition.outOffset + inOffset > previous.duration
				) {
					error(
						'overlapping-transitions',
						child.path,
						'Transitions overlap within their shared item.',
					);
				}
			}
		}

		if (sourceRange !== null) {
			node.sourceStart = sourceRange.start;
			node.duration = sourceRange.duration;
		}

		if (!Number.isFinite(node.duration)) {
			error(
				'invalid-range',
				path,
				'The composition duration exceeds the finite numeric range.',
			);
			return null;
		}

		return node;
	};

	if (!isRecord(input.tracks) || input.tracks.OTIO_SCHEMA !== 'Stack.1') {
		error(
			'invalid-tracks',
			'$.tracks',
			'Timeline.tracks must be a Stack.1 object.',
		);
		return result;
	}

	result.root = item(input.tracks, '$.tracks', {
		kind: 'Video',
		enabled: true,
		depth: 0,
	});
	return result;
};

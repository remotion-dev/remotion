export const getOpenTimelineFrameRate = (contents: string): number | null => {
	let timeline: unknown;
	try {
		timeline = JSON.parse(contents);
	} catch {
		return null;
	}

	const isRecord = (value: unknown): value is Record<string, unknown> =>
		typeof value === 'object' && value !== null && !Array.isArray(value);
	const getRate = (value: unknown): number | null =>
		isRecord(value) &&
		value.OTIO_SCHEMA === 'RationalTime.1' &&
		typeof value.rate === 'number' &&
		Number.isFinite(value.rate) &&
		value.rate > 0
			? value.rate
			: null;

	if (!isRecord(timeline) || timeline.OTIO_SCHEMA !== 'Timeline.1') {
		return null;
	}

	const timelineRate = getRate(timeline.global_start_time);
	if (timelineRate !== null) {
		return timelineRate;
	}

	const rates: number[] = [];
	const visit = (value: unknown) => {
		if (!isRecord(value)) {
			return;
		}

		let range = value.source_range;
		if (
			!isRecord(range) &&
			['Clip.1', 'Clip.2'].includes(String(value.OTIO_SCHEMA))
		) {
			const reference =
				value.OTIO_SCHEMA === 'Clip.2' &&
				isRecord(value.media_references) &&
				typeof (value.active_media_reference_key ?? 'DEFAULT_MEDIA') ===
					'string'
					? value.media_references[
							(value.active_media_reference_key ?? 'DEFAULT_MEDIA') as string
						]
					: value.media_reference;
			range = isRecord(reference) ? reference.available_range : null;
		}

		if (isRecord(range)) {
			for (const time of [range.start_time, range.duration]) {
				const rate = getRate(time);
				if (rate !== null) rates.push(rate);
			}
		} else if (
			value.OTIO_SCHEMA === 'Gap.1' ||
			value.OTIO_SCHEMA === 'Filler.1'
		) {
			const rate = getRate(value.duration);
			if (rate !== null) rates.push(rate);
		}

		if (Array.isArray(value.children)) {
			value.children.forEach(visit);
		}
	};

	visit(timeline.tracks);
	const firstRate = rates[0];
	if (firstRate === undefined) {
		return null;
	}

	return rates.every((rate) => Math.abs(rate - firstRate) < firstRate * 1e-8)
		? firstRate
		: null;
};

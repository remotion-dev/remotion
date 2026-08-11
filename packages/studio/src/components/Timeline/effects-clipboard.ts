import {
	parseEffectClipboardDataResult,
	type EffectClipboardData,
} from '@remotion/studio-shared';

const attribute = 'data-remotion-effects-clipboard';

export type EffectsClipboardEnvelope = {
	readonly envelopeVersion: 1;
	readonly payload: EffectClipboardData;
	readonly sourceIdentity: string | null;
	readonly originalEffectIndices: number[];
};

const getClipboardLabel = (effects: number): string =>
	effects === 1 ? 'Remotion effect' : `${effects} Remotion effects`;

export const makeEffectsClipboardHtml = (
	envelope: EffectsClipboardEnvelope,
): string =>
	`<span ${attribute}="${encodeURIComponent(JSON.stringify(envelope))}">${getClipboardLabel(envelope.payload.effects.length)}</span>`;

export const parseEffectsClipboardHtml = (
	html: string,
): EffectsClipboardEnvelope | null => {
	const match = html.match(new RegExp(`${attribute}=["']([^"']+)["']`, 'i'));
	if (!match?.[1]) {
		return null;
	}

	try {
		const candidate = JSON.parse(decodeURIComponent(match[1])) as Record<
			string,
			unknown
		>;
		if (
			candidate.envelopeVersion !== 1 ||
			(candidate.sourceIdentity !== null &&
				typeof candidate.sourceIdentity !== 'string') ||
			!Array.isArray(candidate.originalEffectIndices) ||
			!candidate.originalEffectIndices.every(
				(index) => Number.isInteger(index) && index >= 0,
			)
		) {
			return null;
		}

		const result = parseEffectClipboardDataResult(
			JSON.stringify(candidate.payload),
		);
		if (result.status !== 'valid') {
			return null;
		}

		const originalEffectIndices = candidate.originalEffectIndices as number[];
		const sourceIdentity = candidate.sourceIdentity as string | null;
		if (
			(sourceIdentity === null && originalEffectIndices.length !== 0) ||
			(sourceIdentity !== null &&
				(originalEffectIndices.length !== result.data.effects.length ||
					new Set(originalEffectIndices).size !== originalEffectIndices.length))
		) {
			return null;
		}

		return {
			envelopeVersion: 1,
			payload: result.data,
			sourceIdentity,
			originalEffectIndices,
		};
	} catch {
		return null;
	}
};

export const writeEffectsClipboardEnvelope = async (
	envelope: EffectsClipboardEnvelope,
): Promise<void> => {
	const label = getClipboardLabel(envelope.payload.effects.length);
	await navigator.clipboard.write([
		new ClipboardItem({
			'text/html': new Blob([makeEffectsClipboardHtml(envelope)], {
				type: 'text/html',
			}),
			'text/plain': new Blob([label], {type: 'text/plain'}),
		}),
	]);
};

export const readClipboardTextAndEffectsEnvelope = (
	clipboardData: DataTransfer,
): {
	readonly text: string;
	readonly envelope: EffectsClipboardEnvelope | null;
} => {
	const html = clipboardData.types.includes('text/html')
		? clipboardData.getData('text/html')
		: '';

	return {
		text: clipboardData.getData('text/plain'),
		envelope: html === '' ? null : parseEffectsClipboardHtml(html),
	};
};

import {expect, test} from 'bun:test';
import type {EffectClipboardData} from '@remotion/studio-shared';
import {
	makeEffectsClipboardHtml,
	parseEffectsClipboardHtml,
	type EffectsClipboardEnvelope,
} from '../components/Timeline/effects-clipboard';

const payload: EffectClipboardData = {
	type: 'effects-additive',
	version: 3,
	remotionClipboard: 'effects',
	effects: [
		{
			callee: 'brightness',
			importPath: '@remotion/effects/brightness',
			params: {amount: {type: 'static', value: 1}},
		},
	],
};

const envelope: EffectsClipboardEnvelope = {
	envelopeVersion: 1,
	payload,
	sourceIdentity: 'source',
	originalEffectIndices: [0],
};

test('effect clipboard data round-trips through marked HTML', () => {
	const html = makeEffectsClipboardHtml(envelope);
	expect(html).toContain('>Remotion effect</span>');
	expect(html).not.toContain(JSON.stringify(payload));
	expect(parseEffectsClipboardHtml(html)).toEqual(envelope);
});

test('effect clipboard HTML rejects invalid envelope data', () => {
	const makeInvalidHtml = (candidate: unknown) =>
		`<span data-remotion-effects-clipboard="${encodeURIComponent(JSON.stringify(candidate))}">Remotion effect</span>`;
	const invalidCandidates = [
		{...envelope, envelopeVersion: 2},
		{...envelope, originalEffectIndices: []},
		{...envelope, originalEffectIndices: [-1]},
		{...envelope, originalEffectIndices: [0.5]},
		{...envelope, sourceIdentity: null},
		{...envelope, payload: {...payload, version: 2}},
	];

	for (const candidate of invalidCandidates) {
		expect(parseEffectsClipboardHtml(makeInvalidHtml(candidate))).toBe(null);
	}

	expect(
		parseEffectsClipboardHtml(
			'<span data-remotion-effects-clipboard="%E0%A4%A">Remotion effect</span>',
		),
	).toBe(null);
	expect(parseEffectsClipboardHtml('<span>Remotion effect</span>')).toBe(null);
});

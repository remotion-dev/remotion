export type PullfrogAssessment = {
	classification: 'actionable' | 'clean' | 'uncertain';
	summary: string;
};

export const parsePullfrogAssessment = (text: string): PullfrogAssessment => {
	const match = text.match(/\{[\s\S]*\}/);
	if (!match) {
		throw new Error('Pullfrog assessment did not return JSON');
	}
	const parsed = JSON.parse(match[0]) as Partial<PullfrogAssessment>;
	if (
		parsed.classification !== 'actionable' &&
		parsed.classification !== 'clean' &&
		parsed.classification !== 'uncertain'
	) {
		throw new Error('Pullfrog assessment returned an invalid classification');
	}
	return {
		classification: parsed.classification,
		summary:
			typeof parsed.summary === 'string' && parsed.summary.trim()
				? parsed.summary.trim().slice(0, 240)
				: 'Pullfrog assessment completed.',
	};
};

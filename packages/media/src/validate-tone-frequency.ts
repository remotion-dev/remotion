export const validateToneFrequency = ({
	toneFrequency,
	component,
}: {
	toneFrequency: number | undefined;
	component: 'Audio' | 'Video';
}) => {
	if (toneFrequency === undefined) {
		return;
	}

	if (
		typeof toneFrequency !== 'number' ||
		!Number.isFinite(toneFrequency) ||
		toneFrequency < 0.01 ||
		toneFrequency > 2
	) {
		throw new TypeError(
			`The \`toneFrequency\` prop of <${component}> must be a finite number between 0.01 and 2, but got ${String(toneFrequency)}.`,
		);
	}
};

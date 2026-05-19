const fps = 30;

export type Section = {
	trimBefore: number;
	trimAfter: number;
};

export const SAMPLE_SECTIONS: Section[] = [
	{trimBefore: 0, trimAfter: 5 * fps},
	{
		trimBefore: 5.2 * fps,
		trimAfter: 10 * fps,
	},
	{
		trimBefore: 13 * fps,
		trimAfter: 18 * fps,
	},
];

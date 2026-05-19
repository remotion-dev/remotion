export type PlayRangeSection = {
	trimBefore: number;
	trimAfter: number;
};

const fps = 24;

export const PLAY_RANGES_MEDIA_DEFAULT: PlayRangeSection[] = [
	{trimBefore: 0.5 * fps, trimAfter: 1 * fps},
	{trimBefore: 1.5 * fps, trimAfter: 2 * fps},
	{trimBefore: 2.5 * fps, trimAfter: 3 * fps},
	{trimBefore: 3.5 * fps, trimAfter: 4 * fps},
	{trimBefore: 4.5 * fps, trimAfter: 5 * fps},
	{trimBefore: 5.5 * fps, trimAfter: 6 * fps},
	{trimBefore: 6.5 * fps, trimAfter: 7 * fps},
	{trimBefore: 7.5 * fps, trimAfter: 8 * fps},
];

export const PLAY_RANGES_MEDIA_ZIP_DEFAULT: PlayRangeSection[] = [
	{trimBefore: 0 * fps, trimAfter: 4 * fps},
	{trimBefore: 4.5 * fps, trimAfter: 5 * fps},
	{trimBefore: 5.5 * fps, trimAfter: 6 * fps},
	{trimBefore: 6.5 * fps, trimAfter: 7 * fps},
	{trimBefore: 7.5 * fps, trimAfter: 8 * fps},
];

import {TCaption} from 'remotion';

interface CaptionFfmpegInputs {
	captionFilters: string[];
	captionInputs: [string, string][];
}

/**
 * TODO: Support more formats.
 * The below only works for SRT.
 */
const getFilter = (index: number): string[] => [
	'-map',
	`${index}:s`,
	'-c:s',
	'mov_text',
];

export const captionsToFfmpegInputs = ({
	assetsCount,
	captions,
}: {
	assetsCount: number;
	captions: TCaption[][];
}): CaptionFfmpegInputs => {
	const uniqueCaptions = Object.values(
		captions.flat(1).reduce<Record<string, TCaption>>((acc, caption) => {
			acc[caption.id] = caption;

			return acc;
		}, {})
	);

	return {
		captionInputs: uniqueCaptions.map((caption) => ['-i', caption.src]),
		captionFilters: uniqueCaptions.reduce<string[]>(
			(acc, _, i) => acc.concat(getFilter(assetsCount + 1 + i)),
			[]
		),
	};
};

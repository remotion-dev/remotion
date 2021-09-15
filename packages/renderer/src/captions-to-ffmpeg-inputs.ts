import {TCaption} from 'remotion';

interface CaptionFfmpegInputs {
	captionFilters: string[];
	captionInputs: [string, string][];
}

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
	const allCaptions = captions.flat(1);
	const uniqueCaptions = Object.values(
		allCaptions.reduce<Record<string, TCaption>>((acc, caption) => {
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

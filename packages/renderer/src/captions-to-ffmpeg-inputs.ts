import type {TCaption} from 'remotion';

interface CaptionFfmpegInputs {
	captionFilters: string[];
	captionInputs: [string, string][];
}

const getFilter = ({language, title}: TCaption, index: number): string[] => {
	return [
		language ? [`-metadata:s:s:${index}`, `language=${language}`] : [],
		title ? [`-metadata:s:s:${index}`, `title=${title}`] : [],
	].flat();
};

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
	const numberOfInputs = assetsCount + uniqueCaptions.length;

	return {
		captionInputs: uniqueCaptions.map((caption) => ['-i', caption.src]),
		captionFilters: [
			// Map each input to be present in the output
			Array.from({length: numberOfInputs}, (_, i) => ['-map', String(i)]),
			//! The subtitle codec for mp4 - TODO: Support others if needed
			//! https://en.wikibooks.org/wiki/FFMPEG_An_Intermediate_Guide/subtitle_options#Set_Subtitle_Codec
			['-c:s', 'mov_text'],
			// For each subtitle, create its metadata, when available
			uniqueCaptions.map(getFilter).flat(),
		].flat(2),
	};
};
